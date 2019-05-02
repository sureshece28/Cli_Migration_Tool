fruit.define('fruit.ui.CountryCombo', {
	extend : 'fruit.ui.ComboBox',
	view : {
		tag : 'span',
		attr : {
			'class' : 'f-combobox',
			'role' : 'combobox',
			'aria-haspopup' : true,
			'aria-expanded' : false
		},
		content : [{
			name : 'text',
			tag : 'input',
			attr : {
				'type' : 'text'
			}
		}, {
			name : 'btn',
			tag : 'span',
			attr : {
				'class' : 'f-combobox-btn'
			}
		}, {
			name : 'popup',
			type : 'Popup',
			attr : {
				'aria-labelledby' : 'combobox'
			},
			content : {
				name : 'list',
				type : 'List'
			}
		}]
	}
})