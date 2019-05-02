<!DOCTYPE html>
<html>
	<body>

<?php
$file = 'file.txt';
// Open the file to get existing content
$current = file_get_contents($file);
// Append a new person to the file
date_default_timezone_set('GMT');
$current .= date('Y-m-d H:i:s'). ",".file_get_contents('php://input')."\n";
// Write the contents back to the file
file_put_contents($file, $current);
?>
</body>
</html>