import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView,StatusBar,Alert } from 'react-native';
import {Text,Overlay,CheckBox,Input} from 'react-native-elements';

import { saveUser,saveToken } from '../models/model_utils.js';
import { StoreObj,TokenObj } from '../models/models.js';
import config from '../config.js';
import crypt_lib from '../crypt_lib.js';


function parseForm(params) {
  var formData = new FormData();
  for (var k in params) { formData.append(k, params[k]); }
  return formData;
}

class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      is_register: false,
      processing: false,
			username:"adminf",
	    password:"abcabc",
	    repassword:"",
	    regdata: {
	    	first_name:"",
	    	last_name:"",
	    	email:"",
	    	permission_id:2,
	    	permission_token:"",
        storename:"",
        description:"",
	    },
	    permission: {'admin':1,'user':2,}
    };
  }

  handleSignUp = () => {
    const {username, password, repassword, regdata} = this.state;
    if (!password || !username) {
      Alert.alert("Lỗi", 'Vui lòng nhập đủ thông tin.',[{text: "OK"}],{ cancelable: false });return;
    }
    if (password!==repassword){
      Alert.alert("Lỗi", 'Mật khẩu đã nhập không khớp.',[{text: "OK"}],{ cancelable: false });return;
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
    
    const tokens = TokenObj; tokens.mapobj({ token: hash_token,refresh_token: '' });
    const store = StoreObj;
    const {realm} = this.props;
    saveUser(realm, {tokens,store});
    this.setState({processing:false});
    this.props.setLogin(true);
  }

  handleLogin = () => {
    const {username, password} = this.state;
    if (!password || !username) {
      Alert.alert("Lỗi", 'Vui lòng nhập đủ thông tin.',[{text: "OK"}],{ cancelable: false });return;
    }
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
    let regdata = this.state.regdata;
    for (var k in o) {regdata[k]=o[k]}
    this.setState({regdata});
  }

	render() {
    const {regdata,permission} = this.state;
		return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#ff9800" />
      <Overlay isVisible={this.state.processing} borderRadius={8} height="auto">
          <Text style={styles.center}>Loadding...</Text>
      </Overlay>
      <Overlay isVisible={this.state.is_register}
        onBackdropPress={() => this.setState({ is_register: false })}
        borderRadius={8} fullScreen={true}
      >
        <ScrollView>
          <Text style={{textAlign:'center',fontWeight:"bold",fontSize:30,color:"#fb5b5a",marginBottom:20}}>SIGN UP</Text>
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
            value={this.state.regdata.first_name}
            onChangeText={text => this.setRegData({first_name:text})}/>
          <Input
            label="Họ" placeholder="Nguyễn Văn"
            labelStyle={styles.orange} containerStyle={styles.mb5}
            value={this.state.regdata.last_name}
            onChangeText={text => this.setRegData({last_name:text})}/>
          <Input
            label="Email" placeholder="abc@abc.abc"
            labelStyle={styles.orange} containerStyle={styles.mb5}
            value={this.state.regdata.email}
            onChangeText={text => this.setRegData({email:text})}/>

          <Text style={[styles.orange,styles.label]}>Vai trò</Text>
          <View style={{flex: 1, flexDirection: 'row', marginBottom:8}}>
            <CheckBox
              title='Cửa hàng'
              checked={permission.user===regdata.permission_id}
              onPress={ ()=>this.setRegData({permission_id:permission.user}) }
              checkedIcon='dot-circle-o' uncheckedIcon='circle-o'
              containerStyle={{flex:1, margin:0, backgroundColor: "transparent", borderWidth: 0}}
            />
            <CheckBox
              title='Admin'
              checked={permission.admin===regdata.permission_id}
              onPress={ ()=>this.setRegData({permission_id:permission.admin}) }
              checkedIcon='dot-circle-o' uncheckedIcon='circle-o'
              containerStyle={{flex:1, margin:0, backgroundColor: "transparent", borderWidth: 0}}
            />
          </View>              

          {permission.admin===this.state.regdata.permission_id &&
          <View style={[styles.inputView,styles.mb5]} >
            <TextInput  
              style={styles.inputText}
              placeholder="Token..." 
              placeholderTextColor="#ffffff"
              value={this.state.regdata.permission_token}
              onChangeText={text => this.setRegData({permission_token:text}) }/>
          </View>
          }

          {permission.user===this.state.regdata.permission_id &&
          <View>
            <View style={[styles.inputView,styles.mb5]} >
              <TextInput  
                style={styles.inputText}
                placeholder="Tên cửa hàng..." 
                placeholderTextColor="#ffffff"
                value={this.state.regdata.storename}
                onChangeText={text => this.setRegData({storename:text}) }/>
            </View>
            <View style={[styles.inputView,styles.mb5]} >
              <TextInput  
                style={styles.inputText}
                placeholder="Mô tả..." 
                placeholderTextColor="#ffffff"
                value={this.state.regdata.description}
                onChangeText={text => this.setRegData({description:text}) }/>
            </View>
          </View>
          }

          <View style={styles.center}>
            <TouchableOpacity onPress={this.handleSignUp} style={[styles.loginBtn,styles.mt40,styles.success,styles.w80p]}>
              <Text style={styles.white}>SIGN UP</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.setState({ is_register: false })}
              style={[styles.loginBtn,styles.bgred,styles.w80p]}>
              <Text style={styles.white}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Overlay>
      <Text style={styles.logo}>BFR Store</Text>
      <View style={[styles.inputView, styles.w80p, styles.mb20]} >
        <TextInput  
          style={styles.inputText}
          placeholder="Tài khoản" 
          placeholderTextColor="#ffffff"
          value={this.state.username}
          onChangeText={text => this.setState({username:text})}/>
      </View>
      <View style={[styles.inputView, styles.w80p, styles.mb20]}>
        <TextInput  
          secureTextEntry
          style={styles.inputText}
          placeholder="Mật khẩu"
          placeholderTextColor="#ffffff"
          value={this.state.password}
          onChangeText={text => this.setState({password:text})}/>
      </View>
      <TouchableOpacity>
        <Text style={{color:"#8c27b0",fontSize:12}}>Quên mật khẩu?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={this.handleLogin} style={[styles.loginBtn,styles.mt40,styles.bgred,styles.w80p]}>
        <Text style={{ color:"#ffffff" }}>ĐĂNG NHẬP</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={text => this.setState({is_register:true,password:'',repassword:''})}
        style={[styles.loginBtn,styles.bgwarning,styles.w80p]}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff2d6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo:{
    fontWeight:"bold",
    fontSize:50,
    color:"#fb5b5a",
    marginBottom:40
  },
  inputView:{
    backgroundColor:"#ffa184",
    borderRadius:25,
    height:50,
    justifyContent:"center",
    padding:20
  },
  mb20:{marginBottom:20,},
  mb5:{marginBottom:5,},
  mt40:{marginTop:40,},
  label:{paddingLeft:10,fontSize: 16,fontWeight: 'bold'},
  w80p:{width:"80%",},
  inputText:{
    height:50,
    color:"white"
  },
  loginBtn:{
    borderRadius:25,
    height:50,
    alignItems:"center",
    justifyContent:"center",
    marginBottom:10
  },
  orange:{color:'#ffa184'},
  success:{backgroundColor:"#8bc34a"},
  bgred: {backgroundColor:"#fb5b5a",},
  bgwarning: {backgroundColor:"#ff9800",},
  white: {color:"#ffffff"},
  center:{alignItems:'center',textAlign:'center'},
});

export default Login;