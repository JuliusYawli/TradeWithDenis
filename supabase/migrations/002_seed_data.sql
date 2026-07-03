insert into public.products (slug, model, storage, condition, grade, price, down_payment_percent, weekly_payment, installment_weeks, stock_status, quantity, image_urls, description, warranty_months, is_featured)
values
('iphone-12-128gb-used', 'iPhone 12', '128GB', 'Used', null, 2850, 40, 214, 12, 'in_stock', 2, array['https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80'], 'Inspected used iPhone with transparent weekly payment terms.', 3, true),
('iphone-13-pro-max-256gb-used', 'iPhone 13 Pro Max', '256GB', 'Used', null, 5850, 40, 439, 12, 'in_stock', 2, array['https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80'], 'Inspected used iPhone with transparent weekly payment terms.', 3, true),
('iphone-14-pro-max-128gb-used', 'iPhone 14 Pro Max', '128GB', 'Used', null, 7000, 40, 525, 12, 'in_stock', 2, array['https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80'], 'Inspected used iPhone with transparent weekly payment terms.', 6, true),
('iphone-15-pro-max-256gb-used-a-plus', 'iPhone 15 Pro Max', '256GB', 'Used', 'A+', 8500, 40, 638, 12, 'in_stock', 2, array['https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80'], 'A+ grade used iPhone with transparent weekly payment terms.', 6, true),
('iphone-16-pro-max-256gb-used', 'iPhone 16 Pro Max', '256GB', 'Used', null, 10500, 40, 788, 12, 'in_stock', 1, array['https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80'], 'Inspected used iPhone with transparent weekly payment terms.', 6, false),
('iphone-17-pro-max-256gb', 'iPhone 17 Pro Max', '256GB', 'New', null, 17900, 40, 1343, 12, 'in_stock', 1, array['https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80'], 'Premium iPhone listing with transparent weekly payment terms.', 12, false)
on conflict (slug) do nothing;

insert into public.testimonials (customer_name, location, rating, quote, is_featured)
values
('Ama B.', 'Accra', 5, 'Clear payment plan, quick responses, and the phone condition matched what I saw online.', true),
('Kwame A.', 'Tema', 5, 'The financing breakdown made it easy to decide before reserving.', true)
on conflict do nothing;

insert into public.site_settings (brand_name, phone, whatsapp, email, address, opening_hours, instagram_url, facebook_url, tiktok_url, google_maps_url, business_registration)
values ('TradeWithDennis', '+233 54 370 9361', '+233 54 370 9361', 'ampiawdennis5@gmail.com', 'Circle Mall, Block C, Shop 27', '8:00 AM - 7:00 PM', 'https://www.instagram.com/tradewithdennis1?utm_source=qr', 'https://www.facebook.com/share/1F1FB8s6x3/?mibextid=wwXIfr', 'https://www.tiktok.com/@tradewithdennis?_r=1&_t=ZS-97gO9Qd1Q5A', 'https://maps.app.goo.gl/ey1DeFiVvcrZf6Lw8', 'BN120850225');
