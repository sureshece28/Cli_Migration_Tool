cisco.fig.define('Component', 'demo.Main', {
	$view : {
		content : [{
			tag : 'h2',
			content : 'Demo for ProgressBar'
		}, {
			name : 'progressBar',
			type : 'ProgressBar',
			options : {
				'width' : '400px',
				'current':30
			}
		}, {
			tag : 'h3',
			content : 'API'
		}, {
			tag : 'div',
			content : [{
				tag : 'p',
				content : [{
					tag : 'p',
					content : 'setCurrentValue:'
				}, {
					name : 'inputText',
					tag : 'input'
				}]
		}]
	},{
		name:'btn',
		type:'Button',
		options:{
			text:'one loop'
		}
	}]
},
	$events : {
		subscribe : {
			inputText : {
				change : '__setCurrentValue'
			},
			btn:{
				'onClick':'__oneLoop'
			}
		}
	},
	$controller : {
		__setCurrentValue : function() {
			 this.progressBar.setCurrentValue(this.inputText.getAttribute('value'));
		},
		__oneLoop:function() {
			var i = 0;
			var p = this.progressBar;
			function loop(){
				p.setCurrentValue(i);
				i+=1;
				if(i<=100 && i>=0){
					setTimeout(loop,50);
				}
			};
			loop();
		}
	}
});

cisco.fig.ready(function() {
	var main = new demo.Main();
	cisco.fig.Application.load(main, 'mvc-container');
})