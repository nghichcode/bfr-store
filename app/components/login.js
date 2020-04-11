import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';

import config from '../config.js'
import crypt_lib from '../crypt_lib.js'

class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
			username:"",
	    password:"",
	    repassword:"",
	    regdata: {
	    	first_name:"",
	    	last_name:"",
	    	email:"",
	    	permission_id:0,
	    	permission_token:""
	    },
	    permission: {'admin':1,'user':2,}
    };
  }

  handleSignUp = () => {
  	if (!this.state.password) {return;}
  	const regdate = Math.floor(new Date()/1000);
  	var password = crypt_lib.hash(this.state.password)+"::"+regdate;
  	var authData = crypt_lib.encrypt(config.encryption_key, password);
  	const payload = {
	    ciphertext : data.ciphertext,
	    salt : data.salt,
	    iv : data.iv,
	    password: password,
	    username: this.state.username,
	    ...this.state.regdata
  	}
  	
		fetch(config.getLocation('auth/login/'), {
		  method: 'POST',
		  body: payload,
		})
		.then((response) => response.json())
    .then((json) => {
      console.log(json);
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleLogin = () => {
  	if (!this.state.password) {return;}
  	var password = crypt_lib.hash(this.state.password);
  	var authData = crypt_lib.encrypt(config.encryption_key, password);
  	const payload = {
	    ciphertext : data.ciphertext,
	    salt : data.salt,
	    iv : data.iv,
	    password: password,
	    username: this.state.username,
	  }

		fetch(config.getLocation('auth/login/'), {
		  method: 'POST',
		  body: payload,
		})
		.then((response) => response.json())
    .then((json) => {
      console.log(json);
    })
    .catch((error) => {
      console.error(error);
    });
  }

	render() {
		return (
   <View style={styles.container}>
      <Text style={styles.logo}>BFR Store</Text>
      <View style={styles.inputView} >
        <TextInput  
          style={styles.inputText}
          placeholder="User Name..." 
          placeholderTextColor="#ffffff"
          onChangeText={text => this.setState({username:text})}/>
      </View>
      <View style={styles.inputView} >
        <TextInput  
          secureTextEntry
          style={styles.inputText}
          placeholder="Password..." 
          placeholderTextColor="#ffffff"
          onChangeText={text => this.setState({password:text})}/>
      </View>
      <TouchableOpacity>
        <Text style={{color:"#9c27b0",fontSize:12}}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginBtn}>
        <Text style={{ color:"#ffffff" }}>LOGIN</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={this.handleSignUp}>
        <Text style={{ color:"#673ab7" }}>Signup</Text>
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
    width:"80%",
    backgroundColor:"#ffa184",
    borderRadius:25,
    height:50,
    marginBottom:20,
    justifyContent:"center",
    padding:20
  },
  inputText:{
    height:50,
    color:"white"
  },
  loginBtn:{
    width:"80%",
    backgroundColor:"#fb5b5a",
    borderRadius:25,
    height:50,
    alignItems:"center",
    justifyContent:"center",
    marginTop:40,
    marginBottom:10
  },
});

export default Login;