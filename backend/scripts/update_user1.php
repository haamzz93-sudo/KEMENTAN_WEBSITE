<?php
$pdo = new PDO('mysql:host=127.0.0.1;port=3307;dbname=sim_benih_horti', 'root', '');
$pdo->exec("UPDATE users SET avatar = '/images/avatar_superadmin.jpg', name = 'Super Admin Pusat (Ditjen Hortikultura)', agency_name = 'Direktorat Perbenihan Hortikultura • Kementan RI' WHERE id = 1");
echo "USER_1_AVATAR_UPDATED_SUCCESS\n";
