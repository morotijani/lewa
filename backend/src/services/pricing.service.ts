import pool from '../db';

interface PricingRules {
    base_fare_ghs: number;
    per_km_ghs: number;
    per_min_ghs: number;
    surge_multiplier: number;
}

export const PricingService = {
    // Haversine formula to calculate distance between two points in km
    calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return parseFloat(d.toFixed(2));
    },

    deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    },

    async getQuote(pickup: { lat: number; lng: number }, dropoff: { lat: number; lng: number }, vehicleType: string) {
        // defaults
        let rules: PricingRules = {
            base_fare_ghs: 10,
            per_km_ghs: 1.5,
            per_min_ghs: 0,
            surge_multiplier: 1.0
        };

        // fetch from DB
        try {
            const result = await pool.query(
                'SELECT base_fare_ghs, per_km_ghs, per_min_ghs, surge_multiplier FROM pricing_rules WHERE vehicle_type = $1 AND active = TRUE LIMIT 1',
                [vehicleType]
            );
            if (result.rows.length > 0) {
                rules = {
                    base_fare_ghs: parseFloat(result.rows[0].base_fare_ghs),
                    per_km_ghs: parseFloat(result.rows[0].per_km_ghs),
                    per_min_ghs: parseFloat(result.rows[0].per_min_ghs),
                    surge_multiplier: parseFloat(result.rows[0].surge_multiplier)
                };
            }
        } catch (e) {
            console.warn('Using default pricing rules due to error or missing rules:', e);
        }

        const distanceKm = this.calculateDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
        const estimatedTimeMin = distanceKm * 3; // Rough estimate: 20km/h average -> 3 min/km in traffic

        let total = (rules.base_fare_ghs + (distanceKm * rules.per_km_ghs) + (estimatedTimeMin * rules.per_min_ghs)) * rules.surge_multiplier;

        // Minimum fare check (could be base fare)
        total = Math.max(total, rules.base_fare_ghs);

        return {
            total_ghs: parseFloat(total.toFixed(2)),
            breakdown: {
                base: rules.base_fare_ghs,
                distance_km: distanceKm,
                cost_per_km: rules.per_km_ghs,
                estimated_time_min: estimatedTimeMin,
                surge: rules.surge_multiplier
            },
            driver_payout: parseFloat((total * 0.8).toFixed(2)) // 80% to driver
        };
    }
};
