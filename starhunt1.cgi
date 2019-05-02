#!/usr/cisco/python/bin/python3
import cgi
import re
import os
import cgitb; cgitb.enable()
import subprocess 
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
		pattern=form.getvalue('searchstring')
		image_type=form.getvalue('image').strip().split(",")
		image = image_type[0]
		type = image_type[1]
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
		#print(p.pattern,'<br>')
		check= form.getvalue('radio_b')
		filename = "release/"+image+"/"+check+"."+image+".txt"
		result = set()
		a="YES"
		b="NO"
		if os.path.exists(filename):

			txt = open(filename)
			flag=1
			for line in txt:
				m=p.search(line)
				if m:
					flag=0
					result.add(line)
			if flag:
				print("NO MATCH FOUND",'<br>')
			result=sorted(result)
			print ('<table border="1">')
			if type == 'ios':
				print ('<tr><th>Polaris</th></tr>')
			else:
				print ('<tr><th>Polaris</th><th>IOS</th></tr>')
			#print(result)
			for rr in result:
				msplit = rr.split()
				if "@" in msplit:
					#print (rr[:-2])
					print('<tr><td><a href="match.cgi?word='+rr[:-2]+'&check='+check+'&type='+type+'&image='+image+'" id ="link">',rr[:-2],'</a></td></tr>')
			
			
			
			
			
			
			
			
			
			'''
			for r in result:
				msplit = r.split()
				if "@" in msplit:
					#print (r[:-2])
        
					print('<tr><td><a href="match.cgi?word='+r[:-2]+'&check='+check+'&type='+type+'&image='+image+'" id ="link">',r[:-2],'</a></td><td><a href="match.cgi?word='+r[:-2]+'&check='+check+'&type='+type+'&image='+image+'" id ="link">',r[:-2],'</a></td></tr>')
				#	print('<input type="checkbox" name="Yes" checked>'+a+'<br>')
					#print('<br>')
				if "!" in msplit:	
					print('<tr><td><a href="match.cgi?word='+r[:-2]+'&check='+check+'&type='+type+'&image='+image+'" id ="link">',r[:-2],'</a></td><td></td></tr>')
				#	print('<input type="checkbox" name="No">'+b+'<br>')
					#print('<br>')'''
			print ('</table>')
		else:
			print("Invalid Selection",'<br>')
		htmlTail()
	except:
		cgi.print_exception()