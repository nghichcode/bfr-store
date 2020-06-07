const ROLE = {
  'admin':1,
  'user':2,
  'guest':3,
};
const ROLE_NAME = {
  1:'admin',
  2:'user',
  3:'guest',
};
const APPROVE_STATUS = {
  'ignored':-1,
  'pending':0,
  'approved':1,
  'valid':8,
  'all':9
};

const mapobj = function (obj){
  for(let i in obj){
    if(i in this.properties && i!='id' && obj[i]!=null){
      this.properties[i]=(isNaN(obj[i])||(obj[i]==''))?obj[i]:parseInt(obj[i]);
    }
  }
};

const TokenSchema = {
  name: 'Token',
  primaryKey: 'id',
  properties: {
    id: 'int',
    token: 'string',
    refresh_token: 'string',
  }
};
const TokenObj = function(){
  this.name = 'Token';
  this.properties = {
    id: 1,
    token: '',
    refresh_token: '',
  };
  this.mapobj = mapobj.bind(this);
};

const UserSchema = {
  name: 'User',
  primaryKey: 'id',
  properties: {
    id: 'int',
    username:  'string',
    first_name: 'string',
    last_name: 'string',
    email: 'string',
    permission_id: 'int'
  }
};
const UserObj = function(){
  this.name = 'User';
  this.properties = {
    id: 1,
    username:  '',
    first_name: '',
    last_name: '',
    email: '',
    permission_id:3
  };
  this.mapobj = mapobj.bind(this);
};
const UserLabel = {
  name: 'User',
  properties: {
    username:  'Tên tài khoản:',
    first_name: 'Tên:',
    last_name: 'Họ:',
    email: 'Email:',
    permission_id: 'Quyền:'
  }
};

const StoreSchema = {
  name: 'Store',
  primaryKey: 'id',
  properties: {
    id: 'int',
    storename: 'string',
    location:  'string',
    hide_detail: 'int',
    img_url: 'string',
    description: 'string',
  }
};
const StoreObj = function(){
  this.name = 'Store';
  this.properties = {
    id: 1,
    storename: '',
    location:  '',
    hide_detail: 1,
    img_url: '',
    description: '',
  };
  this.mapobj = mapobj.bind(this);
};
const StoreLabel = {
  name: 'Store',
  properties: {
    storename: 'Tên cửa hàng:',
    location:  'Vị trí:',
    hide_detail: 'Ẩn thông tin:',
    img_url: 'Ảnh',
    description: 'Mô tả:',
  }
};

const ObjectMap = function(){
  this.name = '';
  this.properties = {};
  this.mapobj = function(obj) {
    for(let i in obj){
      if(obj[i]!=null){
        this.properties[i]=(isNaN(obj[i])||(obj[i]==''))?obj[i]:parseInt(obj[i]);
      }
    }
  };
};

export {
	TokenSchema,UserSchema,StoreSchema,
  TokenObj,UserObj,StoreObj,
  UserLabel,StoreLabel,
  ROLE_NAME,ROLE,ObjectMap,
  APPROVE_STATUS
};
