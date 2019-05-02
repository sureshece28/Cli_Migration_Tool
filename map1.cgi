#!/usr/cisco/python/bin/python3
import cgi
import re
import os
import mmap
def htmlTop():
	print("""Content-type:text/html\n\n
		 <!DOCTYPE html>
		 <html lang="en">
		    <head>
			<meta charset="utf-8"/>
				<title>My server</title>
		     </head>
	            <body>""")
def htmlTail():
	print("""</body>
		</html>""")

#main
if __name__ =="__main__":
	try:
		htmlTop()
		form = cgi.FieldStorage()
		ios = form.getvalue('ios')
		polaris = form.getvalue('polaris')
		f_ios = open('release/ios.txt','a+')
		f_polaris = open('release/polaris.txt','a+')
		f_ios.write(ios+'\n')
		f_polaris.write(polaris+'\n')
		print('Successfully Submitted')
		f_ios.close()
		f_polaris.close()
		htmlTail()
	except:
		cgi.print_exception()
