const config = {
	host:'http://192.168.1.16/',
	path:'ignite-api/api/',
	getLocation:function(name) {
		return this.host+this.path+name;
	},
	'encryption_key': 'eFQlByOIVdLnvhxus91H2dIqKq5W8OzF',
	'schemaVersion':1
};

export default config;