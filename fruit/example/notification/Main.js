fruit.ready(function() {

	var notice = new fruit.ui.Notification({
		type : 'Alert',
		message : 'Demo Notification Text!',
		//hasIcon : false,
		//hasClose : false,
		autoClose : 1000,
	});
	
	var _container = document.getElementById('noticeContainer');
	//notice.renderTo(_container);
	notice.renderTo();
});
