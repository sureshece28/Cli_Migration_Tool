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
		#print(p.pattern,'<br>')
		check= form.getvalue('radio_b')
	
			
			
		
		
		
		filename = "release/"+image+"/"+check+"."+image+".txt"
		#filename1 = "rel/"+image+"/"+check+"."+image+".txt"
		
		
		result = set()
		a="YES"
		b="NO"
		if os.path.exists(filename):

			txt = open(filename)
			flag=1
			for line in txt:
				line=line.strip()
				if re.search(r"<.*?>",line,re.I):
					continue
				m=p.search(line)
				if m:
				
				
				
				
					flag=0
					result.add(line)
			else:
			#if flag:  ##########################################################################################################
				filename11 = "rel/cat6k/"+check+".""cat6k.txt"
				result1 = set()
				a="YES"
				b="NO"
				if os.path.exists(filename11):
	
					txttt = open(filename11)
					
					for line1 in txttt:
						line1=line1.strip()
						if re.search(r"<.*?>",line1,re.I):
							continue
						#print("line1\r\n",line1)	
						mm=p.search(line1)
						#print('MM \n',mm)
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
				#print('line2 \r\n',line2)
				m=p.search(line2)
				if m:
				
				
				
				
					
					result2.add(line2)
				
			
			###################
					
				#print("N!!!!",'<br>')
			result=sorted(result)
			
			
			
			
#######################

			print ('<table border="1">')
			if type == 'ios':
				print ('<tr><th>Polaris</th><th>IOS</th></tr>')
			else:
				print ('<tr><th>IOS</th><th>Polaris</th></tr>')
				
			for rr in result1:
				#print ("result1",result1)
				#print ("RR",rr)
				msplit1 = rr.split()
				#print ('SPLIT1:',msplit1)
				#if "@" in msplit:
					#print (rr[:-2])
					
					
			txtt = open(filename11)
			#wwe = open(filename2)
			nlines = 0
			#lined = []
			for lined in txtt:
				#print("lined______>",lined)
				nlines += 1
				#print("LINED______>",lined)
				#print ("nlinesssssssssss",nlines)
				for rr in result1:
					#print("RR value",rr)
					#print("line12",lined)
					x=lined.find(rr)
					#print("x value",x)
					if (x >= 0):
						#print ("Its here.", nlines)
						theline = linecache.getline(filename2,nlines)
						#print(theline)
						thelines = linecache.getline(filename11,nlines)
						#print(thelines)  		
		
						print('<tr><td><a href="" id ="link">',theline,'</a></td><td><a href="" id ="link">',thelines,'</a></td></tr>')	
					
			for rrr in result2:
				#print ("result2",result2)
				#print ("RRR Value",rrr)
				msplit1 = rrr.split()
				#print ('SPLIT22:',msplit1)
				#if "@" in msplit:
					#print (rr[:-2])
			txttt = open(filename2)
			nlinesss = 0
			#line12 = ""
			for line12 in txttt:
				nlinesss += 1
				for rrr in result2:
					if (line12.find(rrr) >= 0):
						#print ("Its here.", nlinesss)
						theline = linecache.getline(filename2,nlinesss)
						#print(theline)
						thelines = linecache.getline(filename11,nlinesss)
						#print(thelines)  		
						print('<tr><td><a href="" id ="link">',theline,'</a></td><td><a href="" id ="link">',thelines,'</a></td></tr>')
						#print('<tr><td><a href="word='+rr[:-2]+'&check='+check+'&type=ios&image=cat6k" id ="link">',thelines,'</a></td><td><a href="word='+rr[:-2]+'&check='+check+'&type=polaris&image=StarFleet" id ="link">',theline,'</a></td></tr>')	
					
				
				
			for r in result:
				#print (r)
				msplit = r.split()
				#print ('SPLIT3:',msplit)
				if "!" in msplit:
					print('<tr><td><a href="match.cgi?word='+r[:-2]+'&check='+check+'&type='+type+'&image='+image+'" id ="link">',r[:-2],'</a></td><td></td></tr>')	
				if "@" in msplit:
					#print (r[:-2])
					print('<tr><td><a href="match12.cgi?word='+r[:-2]+'&check='+check+'&type=ios&image=cat6k" id ="link">',r[:-2],'</a></td><td><a href="match12.cgi?word='+r[:-2]+'&check='+check+'&type=polaris&image=StarFleet" id ="link">',rr[:-2],'</a></td></tr>')
	   	 	
				
	
			txtt = open(filename2)
			nliness = 0
			line12 = ""
			for line12 in txtt:
				nliness += 1
			for rr in result1:
				if (line12.find(rr) >= 0):
					#print ("Its here.", nlines)
					theline = linecache.getline(filename2,nliness)
					#print(theline)
					thelines = linecache.getline(filename11,nliness)
					#print(thelines)  		
		
				#	print('<tr><td><a href="word='+rr[:-2]+'&check='+check+'&type=ios&image=cat6k" id ="link">',thelines,'</a></td><td><a href="word='+rr[:-2]+'&check='+check+'&type=polaris&image=StarFleet" id ="link">',theline,'</a></td></tr>')
				#	print('<tr><td><a href="match12.cgi?word='+r[:-2]+'&check='+check+'&type=ios&image=cat6k" id ="link">',r[:-2],'</a></td><td><a href="match12.cgi?word='+rr[:-2]+'&check='+check+'&type=polaris&image=StarFleet" id ="link">',rr[:-2],'</a></td></tr>')
				#	print('<tr><td><a href="match.cgi?word='+r[:-2]+'&check='+check+'&type='+type+'&image='+image+'" id ="link">',r[:-2],'</a></td><td><a href="match.cgi?word='+r[:-2]+'&check='+check+'&type='+type+'&image='+image+'" id ="link">',r[:-2],'</a></td></tr>')
				#	print('<input type="checkbox" name="Yes" checked>'+a+'<br>')
					#print('<br>')
				
			print ('</table>')
		else:
			print("Invalid Selection",'<br>')
		htmlTail()
	except:
		cgi.print_exception()

