# Data dictionary

Source: Kaggle Retail Store Inventory Forecasting.

| Source column | Canonical name | Role |
| --- | --- | --- |
| Date | `event_date` | Grain date |
| Store ID | `store_id` | Store |
| Product ID | `product_id` | SKU |
| Units Sold | `units_sold` | Target |
| Inventory Level | `inventory_level` | On-hand |
| Price, Discount, Competitor Pricing | price features | Exogenous |
| Weather Condition, Holiday/Promotion | flags | Exogenous |
| Demand Forecast | `vendor_demand_forecast` | Held out of training features |
