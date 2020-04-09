const config = {
	host:'http://localhost/',
	path:'ignite-api/api/',
	getLocation:function(name) {
		return this.host+this.path+name;
	},
	'encryption_key': 'eFQlByOIVdLnvhxus91H2dIqKq5W8OzF',
};

export default config;