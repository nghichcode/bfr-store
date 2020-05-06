import React from 'react';
import { View, TextInput, TouchableOpacity, ScrollView,StatusBar,Alert } from 'react-native';
import {Text,Overlay,CheckBox,Input} from 'react-native-elements';

import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';

import { saveUser } from '../models/model_utils.js';
import { StoreObj,TokenObj,ROLE } from '../models/models.js';
import { parseForm } from '../utils.js';
import config from '../config.js';
import crypt_lib from '../crypt_lib.js';
import {styles} from './styles/round_theme.js';


class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      is_register: false,processing: false,
      hasCameraPermission:null,
			username:config.username,image:null,
	    password:config.password,repassword:"",remember:true,
	    regdata: {
	    	first_name:"",
	    	last_name:"",
	    	email:"",
	    	permission_id:2,
	    	permission_token:"",
        storename:"",
        description:"",
	    },
    };
  }

  _pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
        base64:true,
      });
      if (!result.cancelled) {
        this.setState({ image: result });
      }
    } catch (e) { Alert.alert("Lỗi", 'Vui lòng cấp quyền.'); }
  };

  handleSignUp = () => {
    const {username, password, repassword, regdata, image} = this.state;
    if (!password || !username) {
      Alert.alert("Lỗi", 'Vui lòng nhập đủ thông tin.',[{text: "OK"}],{ cancelable: false });return;
    }
    if (password!==repassword){
      Alert.alert("Lỗi", 'Mật khẩu đã nhập không khớp.',[{text: "OK"}],{ cancelable: false });return;
    }
    const maxs = config.max_size;
    if(image && (image.width>maxs.width || image.height>maxs.height)) {
      Alert.alert("Lỗi", 'Kích thước ảnh không được vượt quá '+maxs.width+'x'+maxs.height+' pixel',
        [{text: "OK"}],{ cancelable: false }
      );
      return;
    }
    this.setState({processing:true});
    const time = Math.floor(new Date()/1000);
    const hpassword = crypt_lib.hash(password, time);
    const data = crypt_lib.encrypt(config.encryption_key, hpassword);
    
    const params = {
      password: data.ciphertext,
      salt : data.salt,
      iv : data.iv,
      username: username,
      time : time,
      ...regdata
    };
    if(image && image.type && image.base64){
      params['image_base64'] = image.base64;
    }
		fetch(config.getLocation('auth/register/'), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
		  method: 'POST',
		  body: parseForm(params),
		})
    .then((response) => {
      this.setState({processing:false});
      return response.json();
    })
    .then((json) => {
      if(json.error) {
        Alert.alert("Lỗi", json.message+' : '+json.code,[{text: "OK"}],{ cancelable: false });
      } else {
        Alert.alert("Thông báo", "Đăng ký thành công. Vui Lòng đăng nhập.",[{text: "OK"}],{ cancelable: false });
        this.setState({is_register:false});
      }
    })
    .catch((error) => {
      this.setState({processing:false});
      Alert.alert("Lỗi", error.message,[{text: "OK", onPress: () => null}],{ cancelable: false });
    });
  }

  handleGuestLogin = () => {
    this.setState({processing:true});

    const time = Math.floor(new Date()/1000);
    const hash_token = crypt_lib.hash('BFRS'+'::'+config.encryption_key+'::'+time);
    
    const tokens = new TokenObj(); tokens.mapobj({ token: hash_token,refresh_token: '' });
    const store = new StoreObj();
    const {realm} = this.props;
    saveUser(realm, {tokens: tokens.properties,store: store.properties});
    this.setState({processing:false});
    this.props.setLogin(true);
  }

  handleLogin = () => {
    const {username, password, remember} = this.state;
    if (!password || !username) {
      Alert.alert("Lỗi", 'Vui lòng nhập đủ thông tin.',[{text: "OK"}],{ cancelable: false });return;
    }
    if (remember) {config.username=username;config.password=password;}
    else {config.username='';config.password='';}

    this.setState({processing:true});
    const time = Math.floor(new Date()/1000);
    const hpassword = crypt_lib.hash(password);
    const data = crypt_lib.encrypt(config.encryption_key, hpassword);
    
    const params = {
      password: data.ciphertext,
      salt : data.salt,
      iv : data.iv,
      username: username,
      time : time,
    };
    fetch(config.getLocation('auth/login/'), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      method: 'POST',
      body: parseForm(params),
    })
    .then((response) => {
      this.setState({processing:false});
      return response.json();
    })
    .then((json) => {
      if(json.error) {
        Alert.alert("Lỗi", json.message+' : '+json.code,[{text: "OK"}],{ cancelable: false });
      } else {
        // console.log('login.js:125',json);
        const {realm} = this.props;
        saveUser(realm, json);
        this.props.setLogin(true);
      }
    })
    .catch((error) => {
      this.setState({processing:false});
      Alert.alert("Lỗi", error.message,[{text: "OK", onPress: () => null}],{ cancelable: false });
    });
    
  }

  setRegData = (o) => {
    const {regdata} = this.state;
    for (var k in o) {regdata[k]=o[k]}
    this.setState({regdata});
  }

	render() {
    const {regdata,image,remember} = this.state;
		return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#ff9800" />
      <Overlay isVisible={this.state.processing} borderRadius={8} height="auto">
          <Text style={styles.center}>Loading...</Text>
      </Overlay>
      <Overlay isVisible={this.state.is_register}
        borderRadius={8} fullScreen={true}
      >
        <ScrollView>
          <Text style={{textAlign:'center',fontWeight:"bold",fontSize:30,color:"#fb5b5a",marginBottom:20}}>
            ĐĂNG KÝ
          </Text>
          <Input
            label="Tên tài khoản" placeholder="user"
            labelStyle={styles.orange} containerStyle={styles.mb5}
            value={this.state.username}
            onChangeText={text => this.setState({username:text})}/>
          <Input
          secureTextEntry
            label="Mật khẩu" placeholder="password" 
            labelStyle={styles.orange} containerStyle={styles.mb5}
            value={this.state.password}
            onChangeText={text => this.setState({password:text})}/>
          <Input
          secureTextEntry
            label="Nhập lại mật khẩu" placeholder="password"
            labelStyle={styles.orange} containerStyle={styles.mb5}
            value={this.state.repassword}
            onChangeText={text => this.setState({repassword:text})}/>
          <Input
            label="Tên" placeholder="Nam"
            labelStyle={styles.orange} containerStyle={styles.mb5}
            value={regdata.first_name}
            onChangeText={text => this.setRegData({first_name:text})}/>
          <Input
            label="Họ" placeholder="Nguyễn Văn"
            labelStyle={styles.orange} containerStyle={styles.mb5}
            value={regdata.last_name}
            onChangeText={text => this.setRegData({last_name:text})}/>
          <Input
            label="Email" placeholder="abc@abc.abc"
            labelStyle={styles.orange} containerStyle={styles.mb5}
            value={regdata.email}
            onChangeText={text => this.setRegData({email:text})}/>

          <Text style={[styles.orange,styles.label]}>Vai trò</Text>
          <View style={{flex: 1, flexDirection: 'row', marginBottom:8}}>
            <CheckBox
              title='Cửa hàng'
              checked={ROLE.user===regdata.permission_id}
              onPress={ ()=>this.setRegData({permission_id:ROLE.user}) }
              checkedIcon='dot-circle-o' uncheckedIcon='circle-o'
              containerStyle={{flex:1, margin:0, backgroundColor: "transparent", borderWidth: 0}}
            />
            <CheckBox
              title='Admin'
              checked={ROLE.admin===regdata.permission_id}
              onPress={ ()=>this.setRegData({permission_id:ROLE.admin}) }
              checkedIcon='dot-circle-o' uncheckedIcon='circle-o'
              containerStyle={{flex:1, margin:0, backgroundColor: "transparent", borderWidth: 0}}
            />
          </View>              

          {ROLE.admin===regdata.permission_id &&
          <View style={[styles.roundInput,styles.mb5]} >
            <TextInput  
              style={styles.input50}
              placeholder="Token..." 
              placeholderTextColor="#ffffff"
              value={regdata.permission_token}
              onChangeText={text => this.setRegData({permission_token:text}) }/>
          </View>
          }

          {ROLE.user===regdata.permission_id &&
          <View>
            <View style={[styles.roundInput,styles.mb5]} >
              <TextInput  
                style={styles.input50}
                placeholder="Tên cửa hàng..." 
                placeholderTextColor="#ffffff"
                value={regdata.storename}
                onChangeText={text => this.setRegData({storename:text}) }/>
            </View>
            <View style={[styles.roundInput,styles.mb5]} >
              <TextInput  
                style={styles.input50}
                placeholder="Mô tả..." 
                placeholderTextColor="#ffffff"
                value={regdata.description}
                onChangeText={text => this.setRegData({description:text}) }/>
            </View>
            <View style={{
              backgroundColor:"#ffa184",borderRadius:25,height:50,justifyContent:"center",paddingHorizontal:10
            }} >
              <Input
                placeholder="Ảnh..." disabled
                inputContainerStyle={{borderBottomWidth:0,margin:0}}
                labelStyle={styles.orange} containerStyle={{margin:0}}
                value={(image &&image.type)?image.uri.split('/').pop():''}
                leftIcon={
                  <Icon name='image' size={30} color='#ffffff'
                    onPress={this._pickImage}
                  />
                }
                rightIcon={
                  <Icon name='remove' size={30} color='#ffffff'
                    onPress={()=>this.setState({image:null})}
                  />
                }
                onChangeText={text => this.setProduct({product_name:text})}/>
              </View>
          </View>
          }

          <View style={styles.center}>
            <TouchableOpacity onPress={this.handleSignUp}
              style={[styles.roundBtn,styles.bgsuccess,styles.mt40,styles.w80p]}
            >
              <Text style={styles.white}>ĐĂNG KÝ</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.setState({ is_register: false })}
              style={[styles.roundBtn,styles.bgred,styles.w80p]}>
              <Text style={styles.white}>ĐÓNG</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Overlay>
      <Text style={styles.logo}>BFR Store</Text>
      <View style={[styles.roundInput, styles.w80p, styles.mb20]} >
        <TextInput  
          style={styles.input50}
          placeholder="Tài khoản" 
          placeholderTextColor="#ffffff"
          value={this.state.username}
          onChangeText={text => this.setState({username:text})}/>
      </View>
      <View style={[styles.roundInput, styles.w80p, styles.mb5]}>
        <TextInput  
          secureTextEntry
          style={styles.input50}
          placeholder="Mật khẩu"
          placeholderTextColor="#ffffff"
          value={this.state.password}
          onChangeText={text => this.setState({password:text})}/>
      </View>
      <TouchableOpacity>
        <CheckBox
          title='Nhớ mật khẩu?'
          checked={remember}
          onPress={ ()=>this.setState({remember:!remember}) }
          textStyle={{color:"#8c27b0",fontSize:12}}
          containerStyle={{margin:0, backgroundColor: "transparent", borderWidth: 0}}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={this.handleLogin} style={[styles.roundBtn,styles.mt40,styles.bgred,styles.w80p]}>
        <Text style={{ color:"#ffffff" }}>ĐĂNG NHẬP</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={text => this.setState({is_register:true,password:'',repassword:''})}
        style={[styles.roundBtn,styles.bgwarning,styles.w80p]}
      >
        <Text style={{ color:"#ffffff" }}>ĐĂNG KÝ</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={this.handleGuestLogin}>
        <Text style={{ color:"#9c27b0" }}>GUEST</Text>
      </TouchableOpacity>
    </View>
		);
	}
}

export default Login;