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
    				pre {
    display: inline;
    margin: 0;
}
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

if True :
	try:
		htmlTop()
		form = cgi.FieldStorage()
		val=""
		z=0
		pattern=form.getvalue('comment')
		lines=pattern.split('\n')
		#print(p.pattern,'<br>')
		check2= "config.sflt.bin.txt"
		filename = "release/input/"+check2
		result=[]
		if os.path.exists(filename) :
			txt = open(filename)
			for line in txt:
					result.append(line)
		for ix in lines:
			c1=1
			sp=re.match(r"^( )+",ix,re.I)
			sub1=""
			if sp :
				sub1=sp.group(1)
			i=ix.strip()
			if i=='!':
				val+="!"+"\n"
				continue
			input=i.split(" ")
			for l2 in result:
				j=l2.strip()
				j=j.strip('.')
				j=j.strip()
				matchObj = re.match(r"^"+input[0],j,re.I)
				if matchObj:
					output=j.split(" ")
					length1=len(input)
					length2=len(output)
					if length1 == length2 :
						v=0
						cri=""
						for indexi in range(length1):
							if((input[indexi]==output[indexi])==1):
								cri+=input[indexi]+ " "
								v=v+1
							elif re.search(r"WORD|\<[0-9]+\-[0-9]+\>+|[0-9a-zA-Z\.\-]+",line,re.I):
								cri+=input[indexi]
								v=v+1
							else:
								cri=""
								break
						if v == length1:
							val +=sub1+" " " ".join(input) + "\n"
							c1=0
							break
			if c1 ==1 :
				val+="cli is not there  " + "\n"
		vallist=val.split('\n')
		for val in vallist :
			val=val.rstrip()
			if (val=="cli is not there"):
				print ('<pre style="border: none; color:red; font-family:serif;font:36px" >'+val+'</pre><br>')
			else:
				print ('<pre style="border: none; font-family:serif;font:36px" >'+val+'</pre><br>')
		
		
		
	
		fo = open("foo.docs", "w+")
		line = fo.readlines()
		fo.write("")
		fo.write(val)
		fo.close()


		htmlTail()
	except:
		cgi.print_exception()
