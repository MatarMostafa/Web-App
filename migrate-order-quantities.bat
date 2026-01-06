@echo off

REM The database schema has already been updated with cartonQuantity and articleQuantity fields
REM This script is for reference - the changes are already applied via prisma db push

echo Order quantities fields have already been added to the database.
echo cartonQuantity and articleQuantity are now available in the orders table.
echo No migration needed - changes applied successfully!
pause