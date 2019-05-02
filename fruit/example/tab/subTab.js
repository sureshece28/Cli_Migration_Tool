fruit.ready(function() {

	var myTab = new fruit.ui.Tab({
		items : [{
			title : 'Tab1',
			content : '<p>This is Tab-1</p>'
		}, {
			title : 'Tab2',
			content : {
				type : 'fruit.ui.Tab',
				options : {
					items : [{
						title : 'subTab1',
						content : '<p>This is subTab-1</p>'
					}, {
						title : 'subTab2',
						content : '<p>This is subTab-2</p>'
					}, {
						title : 'subTab3',
						content : '<p>This is subTab-3</p>'
					}]
				}
			}
		}, {
			title : 'Tab3',
			content : '<p>This is Tab-3</p>'
		}, {
			title : 'Tab4',
			content : '<p>This is Tab-4</p>'
		}],
		defaultActive : 1
	});

	myTab.renderTo();

	/*
	myTab.addPanel({
	title:'Tab3',
	content: '<p>This is my added Tab</p>'
	},2);
	*/

	//myTab.removePanel(1);

});
