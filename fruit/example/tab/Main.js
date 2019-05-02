fruit.ready(function() {

	var myTab1 = new fruit.ui.Tab({
		items : [{
			id : 1,
			title : 'Tab1',
			content : '<p>This is Tab-1</p>'
		}, {
			id : 2,
			title : 'Tab2',
			content : '<p>This is Tab-2</p>'
		}],
		defaultActive : 0
	});

	var myTab2 = new fruit.ui.Tab({
		items : [{
			id : 1,
			title : 'Tab1',
			content : '<p>This is Tab-1</p>'
		}, {
			id : 2,
			title : 'Tab2',
			content : '<p>This is Tab-2</p>'
		}, {
			id : 3,
			title : 'Tab3',
			content : {
				type : 'fruit.ui.AjaxContainer',
				options : {
					url : 'files/1.txt',
					dataType : 'text',
					useJscript : false
				}
			}
		}],
		defaultActive : 2
	});

	var myTab3 = new fruit.ui.Tab({
		items : [{
			id : 1,
			title : 'Tab1',
			content : '<p>This is Tab-1</p>'
		}, {
			id : 2,
			title : 'Tab2',
			content : '<p>This is Tab-2</p>'
		}, {
			id : 3,
			title : 'Tab3',
			content : {
				type : 'fruit.ui.AjaxContainer',
				options : {
					url : 'files/2.txt',
					dataType : 'text',
					useJscript : true
				}
			}
		}],
		defaultActive : 1
	});

	var myTab4 = new fruit.ui.Tab({
		items : [{
			id : 1,
			title : 'Tab1',
			content : '<p>This is Tab-1</p>'
		}, {
			id : 2,
			title : 'Tab2',
			content : {
				type : 'fruit.ui.IframeContainer',
				options : {
					url : 'files/tab_iframe.html'
				}
			}
		}],
		defaultActive : 0
	});

	/*
	 //anohter method
	 var myTab = new fruit.ui.Tab();
	 var myTabModel = [{
	 title:'Tab1',
	 content: '<p>This is Tab-1</p>'
	 },{ title:'Tab2',
	 content: '<p>This is Tab-2</p>'
	 }];

	 myTab.setModel(myTabModel);
	 */

	myTab1.renderTo();
	myTab2.renderTo();
	myTab3.renderTo();
	myTab4.renderTo();

	
	myTab2.addPanel({
	id : 4,
	title : 'Tab4',
	content : '<p>This is my added Tab</p>'
	}, 4);
	
	//myTab2.removePanel(1);

});
