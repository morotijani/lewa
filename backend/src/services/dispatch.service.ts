import pool from '../db';
import { PricingService } from './pricing.service';
import { SocketService } from './socket.service';

export const DispatchService = {
  // Find nearest online courier with matching vehicle type
  async findNearestCourier(pickupLat: number, pickupLng: number, vehicleType: string, radiusKm: number = 5, excludedCourierIds: string[] = []) {
    // using Haversine formula directly in SQL for ordering

    const cleanQuery = `
      WITH nearby_couriers AS (
        SELECT c.id, c.user_id, c.current_lat, c.current_lng, c.vehicle_type, u.full_name,
        (
          6371 * acos(
            least(1.0, greatest(-1.0, 
              cos(radians($1)) * cos(radians(c.current_lat)) * cos(radians(c.current_lng) - radians($2)) + 
              sin(radians($1)) * sin(radians(c.current_lat))
            ))
          )
        ) AS distance
        FROM couriers c
        JOIN users u ON c.user_id = u.id
        WHERE c.vehicle_type = $3
        AND c.is_online = TRUE
        -- AND u.is_verified = TRUE
        AND (cardinality($5::uuid[]) = 0 OR c.id != ALL($5::uuid[]))
      )
      SELECT * FROM nearby_couriers
      WHERE distance < $4
      ORDER BY distance ASC
      LIMIT 1;
    `;

    // console.log(`Searching for courier: Lat=${pickupLat}, Lng=${pickupLng}, Type=${vehicleType}, Radius=${radiusKm}, Excluded=${excludedCourierIds}`);
    const result = await pool.query(cleanQuery, [pickupLat, pickupLng, vehicleType, radiusKm, excludedCourierIds]);
    // console.log('Courier search result:', result.rows[0]);
    return result.rows[0];
  },

  async assignOrder(orderId: string, excludedCourierIds: string[] = []) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Get Order
      const orderRes = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [orderId]);
      const order = orderRes.rows[0];

      if (!order) throw new Error('Order not found');
      // Allow 'created' (legacy) or 'accepted' (new flow)
      if (!['created', 'accepted', 'confirmed'].includes(order.status)) {
        throw new Error(`Order is not in a dispatchable state (current: ${order.status})`);
      }

      // 2. Find Courier
      // Use the dedicated column if available, fallback to pricing_details, then default to motorcycle
      let vehicleType = order.vehicle_type || 'motorcycle';
      if (!order.vehicle_type && order.pricing_details && order.pricing_details.vehicle_type) {
        vehicleType = order.pricing_details.vehicle_type;
      }

      console.log(`[DispatchService] Searching for ${vehicleType} within 500km of (${order.pickup_lat}, ${order.pickup_lng}) for order ${orderId}`);

      // Increase radius significantly for demo/testing across cities (e.g. Accra to Kumasi)
      const courier = await this.findNearestCourier(order.pickup_lat, order.pickup_lng, vehicleType, 500, excludedCourierIds);

      if (!courier) {
        console.warn(`[DispatchService] NO COURIER FOUND for order ${orderId} in 500km radius`);
        return { success: false, error: 'No couriers available nearby' };
      }




      // 3. Update Order
      const updateRes = await client.query(
        `UPDATE orders SET courier_id = $1, status = 'assigned', updated_at = NOW() WHERE id = $2 RETURNING *`,
        [courier.id, orderId]
      );
      const updatedOrder = updateRes.rows[0];

      // 4. Logging
      console.log(`Assigned courier ${courier.full_name} (${courier.id}) to order ${orderId}`);

      await client.query('COMMIT');

      // Emit full order object to match frontend expectation
      SocketService.emitToRoom(`order_${orderId}`, 'orderStatusUpdated', { orderId, status: 'assigned', order: updatedOrder, courier });
      SocketService.emitToRoom(`user_${order.customer_id}`, 'orderStatusUpdated', { orderId, status: 'assigned', order: updatedOrder, courier });


      // Notify Courier
      // Assuming courier is connected and joined 'courier_{id}' or 'user_{id}'? 
      // SocketService usually joins 'user_{userId}' typically. Let's start with that or check socket.service.ts
      // DispatchService uses courier.id (which is the courier profile ID) or courier.user_id? 
      // findNearestCourier returns c.id, c.user_id via query
      // The socket usually authenticates with User ID. So 'user_{courier.user_id}' is safe.
      SocketService.emitToRoom(`user_${courier.user_id}`, 'newOrder', { order, status: 'assigned' });

      return { success: true, courier };

    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
};
