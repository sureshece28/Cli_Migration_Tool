









<?php
 /*$path = 'data1.txt';
 if (isset($_POST['ios']) && isset($_POST['polaris']) && isset($_POST['radio_b'])) {
    $fh = fopen($path,"a+");
    $string = $_POST['ios'].' - '.$_POST['polaris'].' - '.$_POST['radio_b'];
    fwrite($fh,$string."\n"); // Write information to the file
    fclose($fh); // Close the file
 }*/
 
 $path = 'ios-config.txt';
 $path1 = 'polaris-config.txt';
 if (isset($_POST['ios']) && isset($_POST['radio_bc'])) {
    $fh = fopen($path,"a+");
    $string = $_POST['ios'];
    $string1=$_POST['polaris'];
    
    
    fwrite($fh,$string."\n"); // Write information to the file
    fclose($fh); // Close the file
    $fh1=fopen($path1,"a+");
    fwrite($fh1,$string1."\n");
    fclose($fh);
 //define the receiver of the email
$to = 'kanbunat@cisco.com';
//define the subject of the email
$subject = 'Add Cli IOS Conf'; 
//define the message to be sent. Each line should be separated with \n
$message = "Hi, \n Please find the new Exec cli's receommended \n\n\nIOS\n".$string."\n\n\n\nPolaris\n".$string1; 
//define the headers we want passed. Note that they are separated with \r\n
$headers = "from:IOS-POLARIS-CLI-MIGRATOR";
//send the email
$mail_sent = @mail( $to, $subject, $message, $headers );
//if the message is sent successfully print "Mail sent". Otherwise print "Mail failed" 







 }
 
 
  $path = 'ios-Exec.txt';
  $path1 = 'polaris-Exec.txt';
 if (isset($_POST['ios']) && isset($_POST['radio_be'])) {
    $fh = fopen($path,"a+");
    echo $path;
    echo $path1;
    $string = $_POST['ios'];
    $string1=$_POST['polaris'];
    
    fwrite($fh,$string."\n"); // Write information to the file
    fclose($fh); // Close the file
 
    $fh1=fopen($path1,"a+");
    fwrite($fh1,$string1."\n");
    fclose($fh);
$to = 'kanbunat@cisco.com,prshanmu@cisco.com';
$subject = 'Add CLI IOS Exec'; 
#$message = $string."\n"; 
$message = "Hi, \n Please find the new Exec cli's receommended \n\n\nIOS\n".$string."\n\n\n\nPolaris\n".$string1; 
$headers = "from:IOS-POLARIS-CLI-MIGRATOR";

$mail_sent = @mail( $to, $subject, $message, $headers );
 
 
 
 
 
 
 
 }
 
  $path = 'ios-Test.txt';
  $path1 = 'Polaris-Test.txt';
 if (isset($_POST['ios']) && isset($_POST['radio_bt'])) {
    $fh = fopen($path,"a+");
    $string = $_POST['ios'];
    $string1=$_POST['polaris'];
    fwrite($fh,$string."\n"); // Write information to the file
    fclose($fh); // Close the file
    $fh1=fopen($path1,"a+");
    fwrite($fh1,$string1."\n");
    fclose($fh);
$to = 'kanbunat';
$subject = 'Add CLI IOS Test'; 
#$message = $string."\n"; 
$message = "Hi, \n Please find the new Exec cli's receommended \n\n\nIOS\n".$string."\n\n\n\nPolaris\n".$string1; 
$headers = "from:IOS-POLARIS-CLI-MIGRATOR";
$mail_sent = @mail( $to, $subject, $message, $headers );
 
 
 
 
 
 }
 
 /*
  $path = 'Polaris-CONFIG.txt';
 if (isset($_POST['polaris']) && isset($_POST['radio_bc'])) {
    $fh = fopen($path,"a+");
    $string = $_POST['polaris'];
    $string1=$_POST['ios'];
    fwrite($fh,$string."\n"); // Write information to the file
    fclose($fh); // Close the file
 
 
 
$to = 'sivavija@cisco.com';
$subject = 'Add CLI Polaris Conf'; 
#$message = $string."\n"; 
$message = "Polaris\n".$string."\n\n\n\nIOS\n".$string1; 
$headers = "";
$mail_sent = @mail( $to, $subject, $message, $headers );
 
 
 
 
 
 
 
 }
 
 
 
 
 
 
 
 
 
 
 
  $path = 'Polaris-EXEC.txt';
 if (isset($_POST['polaris']) && isset($_POST['radio_be'])) {
    $fh = fopen($path,"a+");
    $string = $_POST['polaris'];
    $string1=$_POST['ios'];
    fwrite($fh,$string."\n"); // Write information to the file
    fclose($fh); // Close the file
$to = 'sivavija@cisco.com';
$subject = 'Add CLI Polaris Exec'; 
#$message = $string."\n"; 
$message = "Polaris\n".$string."\n\n\n\nIOS\n".$string1; 
$headers = "";
$mail_sent = @mail( $to, $subject, $message, $headers );
 }
 
 
   $path = 'Polaris-TEST.txt';
 if (isset($_POST['polaris']) && isset($_POST['radio_bt'])) {
    $fh = fopen($path,"a+");
    $string = $_POST['polaris'];
    $string1=$_POST['ios'];
    fwrite($fh,$string."\n"); // Write information to the file
    fclose($fh); // Close the file
    
   
$to = 'sivavija@cisco.com';
$subject = 'Add CLI Polaris Test'; 
#$message = $string."\n"; 
$message = "Polaris\n".$string."\n\n\n\nIOS\n".$string1; 
$headers = "";
$mail_sent = @mail( $to, $subject, $message, $headers );

 }
 
 */
 
echo "<script type='text/javascript'>alert('Mail Sent Successfully'); window.location.href = 'add_t.html?post=$post';</script>";
 
 /*
$_SESSION['message'] = "Your message here";
header('Location: add_cliitest.html');

if ($_SESSION['message'] = "Your message here") {
	
 echo '<script type="text/javascript">alert("' . $_SESSION['message'] . '");</script>';
    unset($_SESSION['message']);
}*/














exit;
 
 /*
//define the receiver of the email
$to = 'sivavija@cisco.com';
//define the subject of the email
$subject = 'Test email'; 
//define the message to be sent. Each line should be separated with \n
$message = $string."\n"; 
//define the headers we want passed. Note that they are separated with \r\n
$headers = "";
//send the email
$mail_sent = @mail( $to, $subject, $message, $headers );
//if the message is sent successfully print "Mail sent". Otherwise print "Mail failed" 
echo $mail_sent ? "Mail sent" : "Mail failed";

 */
 
 

	?>