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
		words =p
		p=re.compile(p,re.IGNORECASE)
		check= form.getvalue('check')
		ios_file = "release/ios.txt"
		polaris_file = "release/polaris.txt"
		print('Selected CLI =<b>',pat,'</b>')
		print('<h4> Match in IOS-POLARIS Mapping Table</h4>')
		if os.path.exists(ios_file) and os.path.exists(polaris_file):
			ios_txt = open(ios_file)
			polaris_txt = open(polaris_file)
			flag = 1
			for ios_line,polaris_line in zip(ios_txt,polaris_txt):
				flag=1
				if type == 'polaris':
					m=p.search(polaris_line)
					if m:
						flag=0
						print(ios_line,'<br>')
				if type == 'ios':
					m=p.search(ios_line)
					if m:
						flag = 0
						print(polaris-line,'<br>')
			if flag:
				print('No entry present in database')
				if type == 'polaris':
					print('<h4>Match in  IOS CLI database</h4>')
					filename = "release/s6t64-adventerprisek9_dbg-mz.SSA.153-1.IE101.296_20160218/"+check+".s6t64-adventerprisek9_dbg-mz.SSA.153-1.IE101.296_20160218.txt"	
				else:
					print('<h4>Match in Polaris CLI database</h4>')
					filename ="release/sf.bin/"+check+".sf.bin.txt"
				result =set()
				if os.path.exists(filename):
					txt=open(filename)
					s1 = mmap.mmap(txt.fileno(), 0, access=mmap.ACCESS_READ)
					flag = 1
					if (s1.find(bytes(words, 'UTF-8')) != -1):
						flag = 0 
						print('<b> Exact Match- </b>')
						print(words)
						 
					while is_empty(result) and is_empty(words)== False and flag == 1: 
						txt=open(filename)
						words = words.split(" ")
						pattern = '.*'.join(words)
						words = ' '.join(words)
						pattern=pattern+".*"
						p=re.compile(pattern,re.IGNORECASE)
						for line in txt:
							m=p.search(line)
							if m:
								flag = 0
								result.add(line)
						words = words.rsplit(' ', 2)[0]
						txt.close()
					if flag == 0  and is_empty(result)== False:
						print('<b> Probable Match-</b>')
						result = sorted(result)
						for item in result:
							print(item,'<br>')
					elif flag == 1 and is_empty(result):
						print('No match found')
					else:
						print(' ')

		else:
			print("Invalid Selection")
		htmlTail()
	except:
		cgi.print_exception()
