









<?php
 /*$path = 'data1.txt';
 if (isset($_POST['ios']) && isset($_POST['polaris']) && isset($_POST['radio_b'])) {
    $fh = fopen($path,"a+");
    $string = $_POST['ios'].' - '.$_POST['polaris'].' - '.$_POST['radio_b'];
    fwrite($fh,$string."\n"); // Write information to the file
    fclose($fh); // Close the file
 }*/
 
 $path = 'IOS-CONFI.txt';
 if (isset($_POST['ios']) && isset($_POST['radio_bc'])) {
    $fh = fopen($path,"a+");
    $string = $_POST['ios'].' - '.$_POST['radio_bc'];
    fwrite($fh,$string."\n"); // Write information to the file
    fclose($fh); // Close the file

 //define the receiver of the email
$to = 'sivavija@cisco.com';
//define the subject of the email
$subject = 'Add Cli IOS Conf'; 
//define the message to be sent. Each line should be separated with \n
$message = $string."\n"; 
//define the headers we want passed. Note that they are separated with \r\n
$headers = "";
//send the email
$mail_sent = @mail( $to, $subject, $message, $headers );
//if the message is sent successfully print "Mail sent". Otherwise print "Mail failed" 







 }
 
 
  $path = 'IOS-EXE.txt';
 if (isset($_POST['ios']) && isset($_POST['radio_be'])) {
    $fh = fopen($path,"a+");
    $string = $_POST['ios'].' - '.$_POST['radio_be'];
    
    fwrite($fh,$string."\n"); // Write information to the file
    fclose($fh); // Close the file
 
$to = 'sivavija@cisco.com';
$subject = ' Add CLI IOS Exec'; 
$message = $string."\n"; 
$headers = "";

$mail_sent = @mail( $to, $subject, $message, $headers );
 
 
 
 
 
 
 
 }
 
   $path = 'IOS-TEST.txt';
 if (isset($_POST['ios']) && isset($_POST['radio_bt'])) {
    $fh = fopen($path,"a+");
    $string = $_POST['ios'].' - '.$_POST['radio_bt'];
    fwrite($fh,$string."\n"); // Write information to the file
    fclose($fh); // Close the file
 
$to = 'sivavija@cisco.com';
$subject = 'Add CLI IOS Test'; 
$message = $string."\n"; 
$headers = "";
$mail_sent = @mail( $to, $subject, $message, $headers );
 
 
 
 
 
 }
 
 
  $path = 'Polaris-CONFIG.txt';
 if (isset($_POST['polaris']) && isset($_POST['radio_bc'])) {
    $fh = fopen($path,"a+");
    $string = $_POST['polaris'].' - '.$_POST['radio_bc'];
    fwrite($fh,$string."\n"); // Write information to the file
    fclose($fh); // Close the file
 
 
 
$to = 'sivavija@cisco.com';
$subject = 'Add CLI Polaris Conf'; 
$message = $string."\n"; 
$headers = "";
$mail_sent = @mail( $to, $subject, $message, $headers );
 
 
 
 
 
 
 
 }
 
 
 
 
 
 
 
 
 
 
 
  $path = 'Polaris-EXEC.txt';
 if (isset($_POST['polaris']) && isset($_POST['radio_be'])) {
    $fh = fopen($path,"a+");
    $string = $_POST['polaris'].' - '.$_POST['radio_be'];
    fwrite($fh,$string."\n"); // Write information to the file
    fclose($fh); // Close the file
$to = 'kanbunat@cisco.com';
$subject = 'Add CLI Polaris Exec'; 
$message = $string."\n"; 
$headers = "";
$mail_sent = @mail( $to, $subject, $message, $headers );
 }
 
 
   $path = 'Polaris-TEST.txt';
 if (isset($_POST['polaris']) && isset($_POST['radio_bt'])) {
    $fh = fopen($path,"a+");
    $string = $_POST['polaris'].' - '.$_POST['radio_bt'];
    fwrite($fh,$string."\n"); // Write information to the file
    fclose($fh); // Close the file
    
   
$to = 'kanbunat@cisco.com';
$subject = 'Add CLI Polaris Test'; 
$message = $string."\n"; 
$headers = "";
$mail_sent = @mail( $to, $subject, $message, $headers );

 }
 
 
echo "<script type='text/javascript'>alert('Mail Sent Successfully'); window.location.href = 'add_cliitestt.html?post=$post';</script>";
 
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