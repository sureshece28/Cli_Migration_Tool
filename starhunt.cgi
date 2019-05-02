#!/usr/cisco/python-3.3.1/bin/python3
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
		pattern=pattern.strip()
		real_line=pattern.split(" ")
		real_line_length=len(real_line)
		pattern="^"+pattern+".*"
		#print(pattern,'<br>')
		p=re.compile(pattern,re.IGNORECASE)
		#print(p.pattern,'<br>')
		check= form.getvalue('radio_b')
		filename = "release/"+image+"/"+check+"."+image+".txt"
		result = set()
		result1 =[]
		result2 =[]
		a="YES"
		b="NO"
		scfl=[]
		if type=='ios':
			filename4 = "ios-"+check+".txt"
			filename3  = "polaris-"+check+".txt"
		else:
			filename3 = "ios-"+check+".txt"
			filename4  = "polaris-"+check+".txt"
		if os.path.exists(filename3) and os.path.exists(filename4):
			txt1 = open(filename3)
			flag=1
			lineno=[]
			lno=0
			for line in txt1:
				nflag=0
				line=line.strip()
				if re.search(r"^<.*?>",line,re.I):
					continue
				m=p.search(line)
				insidelines=line.split(" ")
				insidelines_length=len(insidelines)
				if insidelines_length==real_line_length :
					v=0
					cri=""
					for indexi in range(insidelines_length):
						if((insidelines[indexi]==real_line[indexi])==1):
							cri+=real_line[indexi]+ " "
							v=v+1
						elif re.search(r"WORD|\<LINE\>|\<[0-9]+\-[0-9]+\>|(A\.B\.C\.D)",insidelines[indexi],re.I):
							cri+=real_line[indexi]
							v=v+1
						else:
							cri=""
							break
					if v == insidelines_length:
						nflag=1
				if nflag:
					flag=0
					result1.append(line)
					lineno.append(lno)
				lno=lno+1
			txt2 =open(filename4)
			txt2=txt2.read().splitlines()
			newlineno=0
			for lno1 in lineno:
				for line in txt2:
					if newlineno == lno1:
						newlineno=0
						scfl.append(line)
						break
					newlineno=newlineno+1
		if os.path.exists(filename):
			txt = open(filename)
			flag=1
			for line in txt:
				line=line.strip()
				if re.search(r"^<.*?>",line,re.I):
					continue
				m=p.search(line)
				if m:
					flag=0
					result.add(line)
			result1=sorted(result1)
			#print(result)
			if not (result1 or result):
				print('<p style="color: red;" >NO MATCH FOUND</p>')
			else:
				print ('<table border="1">')
				if type == 'ios':
					print ('<tr><th>Polaris</th><th>IOS</th></tr>')
				else:
					print ('<tr><th>IOS</th><th>Polaris</th></tr>')
			if result1 :
				for i in range(len(result1)):
					if scfl[i] :
						print('<tr><td>'+result1[i]+'</td><td style="color: green;">'+scfl[i]+'</td></tr>')
					else:
						print('<tr><td style="color: green;">'+result1[i]+'</td><td style="color: red;">CLI NOT AVAILABLE</td></tr>')
			if result :
				for r in result:
					msplit = r.split()
					if "@" in msplit:
						#print (r[:-2])
	        
						print('<tr><td><a href="match.cgi?word='+r[:-2]+'&check='+check+'&type='+type+'&image='+image+'" id ="link">',r[:-2],'</a></td><td><a href="match.cgi?word='+r[:-2]+'&check='+check+'&type='+type+'&image='+image+'" id ="link">',r[:-2],'</a></td></tr>')
					#	print('<input type="checkbox" name="Yes" checked>'+a+'<br>')
						#print('<br>')
					if "!" in msplit:	
						print('<tr><td  style="color: red;">CLI NOT AVAILABLE</td><td><a href="match.cgi?word='+r[:-2]+'&check='+check+'&type='+type+'&image='+image+'" id ="link">',r[:-2],'</a></td></tr>')
					#	print('<input type="checkbox" name="No">'+b+'<br>')
						#print('<br>')
			#	print('<tr><td>'+result1[0]+'</td>'+result2[0]+'<td></td></tr>')
			print ('</table>')
		else:
			print("Invalid Selection",'<br>')
		htmlTail()
	except:
		cgi.print_exception()

