-- Assign existing bottles to user
-- Replace 'YOUR_USER_ID' with your actual user_id: 1a19a0cd-6f61-4754-b7dc-5edfd5d8eab3
UPDATE bottles 
SET user_id = '1a19a0cd-6f61-4754-b7dc-5edfd5d8eab3'
WHERE user_id IS NULL;

-- Assign existing consumption history to user
UPDATE consumption_history 
SET user_id = '1a19a0cd-6f61-4754-b7dc-5edfd5d8eab3'
WHERE user_id IS NULL;

-- Verify the updates
SELECT COUNT(*) as bottles_updated FROM bottles WHERE user_id = '1a19a0cd-6f61-4754-b7dc-5edfd5d8eab3';
SELECT COUNT(*) as history_updated FROM consumption_history WHERE user_id = '1a19a0cd-6f61-4754-b7dc-5edfd5d8eab3';
