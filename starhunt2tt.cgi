#!/usr/cisco/python/bin/python3
import cgi
import re
import os
import cgitb; cgitb.enable()
import subprocess 
import linecache
def htmlTop():
	print("""Content-type:text/html;charset=utf-8\n\n
		 <!DOCTYPE html>
		 <html lang="en">
		    <head>
				<meta charset="utf-8"/>
				<title>My server</title>
				<script type="text/javascript" src="fruit/js/fruit.js"></script>
				<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
			   </head>
			<style type="text/css">
    				a {text-decoration: none;}
    				a:hover {text-decoration: underline;}
				}
			</style>			
	            <body>""")
def htmlTail():
	print("""<script>
			$(function(){
     $("a").click(function(){
    $(this).after("<img src='fruit/css/images/gif/progress.gif' alt='loading' height='15px'/>").fadeIn();  
  	});

	});
	</script>
	</body>
		</html>""")
#main
if __name__ =="__main__":
	try:
		htmlTop()
		form = cgi.FieldStorage()
		patter=form.getvalue('searchstring')
		pattern=form.getvalue('searchstring')
		image_type=form.getvalue('image').strip().split(",")
		image = image_type[0]
		type = image_type[1]
		print('Selected Image is',image,'and it is',type,'image','<br>')
	
		
	#	print('Selected Image is',image,'and it is',type,'image','<br>')
		#if type == 'ios':
		#	print('<h4> Click on CLI to get Equivalent POLARIS CLI - (YES=CLI PRESENT, NO=CLI NOT PRESENT) </h4>')
		#else:
			#pass
		#	print('<h4> Click on CLI to get Equivalent IOS CLI - (YES=CLI PRESENT, NO=CLI NOT PRESENT) </h4>')
		pattern=pattern.replace(".","\.")
		#print(pattern,'<br>')
		#pattern=re.sub(r'[^\w]', ' ', pattern)
		#words = pattern.split() 
		#pattern ='.*'.join(words)
		#print(pattern,'<br>')
		pattern=".*"+pattern+".*"
		#print(pattern,'<br>')
		p=re.compile(pattern,re.IGNORECASE)
		p1=re.compile(pattern,re.IGNORECASE)
		#print(p.pattern,'<br>')
		check= form.getvalue('radio_b')
	
			
			
		
		
		
	
			
#######################

		filename1 = "rel/cat6k/"+check+".""cat6k.txt"
		result1 = set()
		a="YES"
		b="NO"
		if os.path.exists(filename1):

			txttt = open(filename1)
			
			for line1 in txttt:
				line1=line1.strip()
				if re.search(r"<.*?>",line1,re.I):
					continue
				print("line1\r\n",line1)	
				mm=p1.search(line1)
				print('MM \n',mm)
				if mm:
				
				
				
				
				
					
					result1.add(line1)			
									
			
					
			
			
#######################			
			
		
		filename2 = "rel/StarFleet/"+check+".""StarFleet.txt"
		result2 = set()
		a="YES"
		b="NO"
		if os.path.exists(filename2):

			txtt = open(filename2)
			
			
			for line2 in txtt:
				line2=line2.strip()
				if re.search(r"<.*?>",line2,re.I):
					continue
				print('line2 \n',line2)
				m=p.search(line2)
				if m:
				
				
				
				
					
					result2.add(line2)
				
			
			###################
		
					
			
			
			
			
			
			print ('<table border="1">')
			if type == 'ios':
				print ('<tr><th>Polaris</th><th>IOS</th></tr>')
			else:
				print ('<tr><th>IOS</th><th>Polaris</th></tr>')
				
			for rr in result1:
				print ("result1\n",result1)
				print ("RR\n",rr)
				msplit1 = rr.split()
				print ('SPLIT1:-----------\n',msplit1)
				#if "@" in msplit:
					#print (rr[:-2])	
				
				
				
				
			for r in result2:
				print ('R value \n',r)
				msplit = r.split()
				print ('SPLIT2:-----------',msplit)
				#if "@" in msplit:
					#print (r[:-2])
					
	        	
	
			txtt = open(filename1)
			nlines1 = 0
			for line11 in txtt:	
				nlines1 += 1
				for rr in result1 :
					if (line11.find(rr) >= 0):
						print ("Its here.", nlines1)
						theline = linecache.getline(filename1,nlines1)
						print(theline)
					  		
		
			txtt = open(filename2)
			nlines2 = 0
			nlines3 = 0
			
			for line22 in txtt:
				nlines2 += 1
				nlines3 +=1
			
				if (line22.find(r) >= 0):
					print ("Its here2.", nlines2)
					thelines = linecache.getline(filename2,nlines2)
					print(thelines)
					theline1 = linecache.getline(filename1,nlines3)
					print(theline1)
			
						
					print('<tr><td><a href="word=''&check='+check+'&type=ios&image=cat6k" id ="link">',theline1,'</a></td><td><a herf="">',thelines,'</a></td></tr>')
				
			print ('</table>')
		else:
			print("Invalid Selection",'<br>')
		htmlTail()
	except:
		cgi.print_exception()

