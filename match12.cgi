#!/usr/cisco/python/bin/python3
import cgi
import re
import os
import mmap
import cgitb; cgitb.enable()
def is_empty(any_structure):
    if any_structure:
        return False
    else:
        return True
def htmlTop():
	print("""Content-type:text/html\n\n
		 <!DOCTYPE html>
		 <html lang="en">
		    <head>
			<meta charset="utf-8"/>
				<title>My server</title>
			</head>
	            <body>
			""")
def htmlTail():
	print("""
		</body>
		</html>""")

#main
if __name__ =="__main__":
	try:
		htmlTop()
		form = cgi.FieldStorage()
		image=form.getvalue('image')
		type=form.getvalue('type')
		pat=form.getvalue('word')
		p=pat.replace(".","\.")
		p=re.compile(p,re.IGNORECASE)
		print("ppppppppppp",p)
		check= form.getvalue('check')
		ios_file = "release/ios.txt"
		polaris_file = "release/polaris.txt"
		print('Selected CLI =<b>',pat,'</b>')
		if type == 'polaris':
			print('<h4>Match in  IOS CLI database</h4>')
			filename = "release/cat6K/"+check+".cat6K.txt"
		else:
			print('<h4>Match in Polaris CLI database</h4>')
			filename ="release/StarFleet/"+check+".StarFleet.txt"
		result =set()
		pat_r = pat.replace("."," ").strip()
		p1 = re.compile(pat_r,re.IGNORECASE)
		words = pat_r
		if os.path.exists(filename):
			txt=open(filename)
			s1 = mmap.mmap(txt.fileno(), 0, access=mmap.ACCESS_READ)
			flag = 1
			if (s1.find(bytes(pat, 'UTF-8')) != -1) or (s1.find(bytes(pat_r,'UTF-8')) != -1):
				flag = 0 
				print('<b> Exact Match- </b>')
				print(pat)
			if flag == 1:
				if os.path.exists(ios_file) and os.path.exists(polaris_file):
					ios_txt = open(ios_file)
					polaris_txt = open(polaris_file)
					flag = 1
					for ios_line,polaris_line in zip(ios_txt,polaris_txt):
						if type == 'polaris':
							m=p.search(polaris_line)
							m1=p1.search(polaris_line)
							if m or m1:
								flag=0
								r = ios_line
						if type == 'ios':
							m=p.search(ios_line)
							m1=p1.search(ios_line)
							if m or m1:
								flag = 0
								r = polaris_line
					ios_txt.close()
					polaris_txt.close()
					if flag == 0:
						print('CLI -',r)
					else:
						while is_empty(result) and is_empty(words)== False and flag == 1 and len(words.split()) >= 3:
							txt=open(filename)
							pattern = words
							pattern=".*"+pattern+".*"
							p=re.compile(pattern,re.IGNORECASE)
							for line in txt:
								m=p.search(line)
								if m:
									flag = 0
									result.add(line)
							words = words.rsplit(' ', 1)[0]
							txt.close()
						if flag == 0  and is_empty(result)== False:
							print('<b> Probable Match-</b><br>')
							result = sorted(result)
							for item in result:
								print(item[:-2],'<br>')
						else:
							print('No match found')
		else:
			print("Invalid Selection")
		htmlTail()
	except:
		cgi.print_exception()
