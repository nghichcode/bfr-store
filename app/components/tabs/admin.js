import React from 'react';
import {ScrollView,Alert,View,FlatList,TouchableOpacity} from 'react-native';
import {Text,ListItem,Overlay,Input,Tooltip} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

import {styles} from '../styles/round_theme.js';
import config from '../../config.js';
import {parseForm} from '../../utils.js';
import SearchBarATC from './search_bar_atc.js';
import {getUser} from '../../models/model_utils.js';
import {ROLE} from '../../models/models.js';

class RoundButton extends React.Component {
  render() {
    const {onPress, icon, bottom}=this.props;
    return (
    <View style={{
      position:'absolute',right:16,bottom:bottom,alignItems:'center',justifyContent:'center',zIndex:9
    }}
    >
      <TouchableOpacity activeOpacity={0.68} onPress={onPress}
      style={{
        alignItems:'center',justifyContent:'center',
        width:60,height:60,borderRadius:30,
        backgroundColor:'#3f51b5',
        shadowColor: '#000000',shadowOffset: { width: 10, height: 10 },
        elevation: 6,shadowOpacity: 1,shadowRadius: 6,
       }}>
        <Icon name={icon} size={30} color='#fff' />
      </TouchableOpacity>
    </View>
    );
  }
}


class AdminTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,is_scan:false,
      list: [],approve_item:{},approve_status:0,
      user:{},tokens:{},permission_token:''
    };
  }

  componentDidMount() {
  	const {user,tokens} = getUser(this.props.realm);
    this.setState({user,tokens});
  }

  resultData = (list) => {
  	this.setState({list});
  }

  isAdmin = (tokens,user) => {
    if( !user || user.permission_id!=ROLE['admin'] || !tokens || !tokens.refresh_token ) {
      return false;
    }
    return true;
  }

  fetchData = (search, fetchSuccess) => {
    const {tokens,user,approve_status} = this.state;
    if(!this.isAdmin(tokens,user)) { return; }
    this.setState({loading:true});

    const params = {
      limit: 100,
      offset : 0,
      approve_status:approve_status?8:0,show_action:false,
      search : search,
    };

  	const self = this;
    fetch(config.getLocation('search/search_product/'), {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': "application/json",
        'authorization': tokens.token,
      },
      method: 'POST',
      body: parseForm(params),
    })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      if(json.error) {
        this.setState({loading:false});
        Alert.alert("Lỗi", json.message+' : '+json.code,[{text: "OK"}],{ cancelable: false });
      } else {
        // console.log('admin.js:64',json);
      	const list = fetchSuccess(json.data);
    		self.setState({list});
        this.setState({loading:false});
      }
    })
    .catch((error) => {
      this.setState({loading:false});
      Alert.alert("Lỗi", error.message,[{text: "OK", onPress: () => null}],{ cancelable: false });
    });
  }
  getPermissionToken = ()=>{
    this.setState({loading:true});
    const {tokens,user} = this.state;
    if(!this.isAdmin(tokens,user)) { this.setState({loading:false});return; }

    const self = this;
    fetch(config.getLocation('admin/permission_token/'), {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': "application/json",
        'authorization': tokens.token,
      },
      method: 'POST',
      body: parseForm({o:0}),
    })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      self.setState({loading:false});
      if(json.error) {
        Alert.alert("Lỗi", json.message+' : '+json.code,[{text: "OK"}],{ cancelable: false });
      } else {
        self.setState({permission_token:json.permission_token});
      }
    })
    .catch((error) => {
      self.setState({loading:false});
      Alert.alert("Lỗi", error.message,[{text: "OK", onPress: () => null}],{ cancelable: false });
    });
  }

  approveProduct=(approve)=>{
    const {tokens,user,list,approve_item,loading} = this.state;
    if(!this.isAdmin(tokens,user) || loading) { return; }
    this.setState({loading:true});

    const params = {
      id: approve_item.id,
      approve:approve?1:-1,
    };

    const self = this;
    fetch(config.getLocation('admin/approve_product/'), {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': "application/json",
        'authorization': tokens.token,
      },
      method: 'POST',
      body: parseForm(params),
    })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      if(json.error) {
        this.setState({loading:false});
        Alert.alert("Lỗi", json.message+' : '+json.code,[{text: "OK"}],{ cancelable: false });
      } else {
        // Alert.alert("Thông báo", (approve?'Duyệt':'Xóa')+' thành công.',[{text: "OK"}],{ cancelable: false });
        self.setState({
          list:list.filter((it) => { return it.id!=approve_item.id; }),
          approve_item:{},loading:false
        });
      }
    })
    .catch((error) => {
      this.setState({loading:false});
      Alert.alert("Lỗi", error.message,[{text: "OK", onPress: () => null}],{ cancelable: false });
    });
  }

  render() {
    const {navigation} = this.props;
    const {list,loading,permission_token,is_scan,approve_item,show_action,approve_status} = this.state;
    return (
    <View>
      <SearchBarATC
        fetchData={this.fetchData} resultData={this.resultData} get_all={true} reload={show_action}
        barcodeRecognized={(barcodes, is_scan)=>this.setState({is_scan})}
      >
        {list &&
        <FlatList
          initialNumToRender={list.length}
          keyExtractor={(item, index) => index.toString()}
          data={list}
          renderItem={({ item, index }) => (
            <ListItem
              title={item.product_name}
              rightTitle={
                <View style={{flexDirection:'row'}}>
                  <Icon name={item.is_approved>0?'check':'remove'} size={20} color='tomato'/>
                  <Tooltip backgroundColor='#8bc34a' popover={
                    <Text style={{color:'#fff'}}>Sản phẩm {item.is_approved>0?'đã':'chưa'} được duyệt</Text>
                  }>
                    <Icon name='question-circle' size={20} color='#4caf50'/>
                  </Tooltip>
                  {item.is_trusted>0 && <Icon name='star' size={20} color='tomato'/>}
                </View>
              }
              subtitle={item.gtin_code}
              rightSubtitle={item.price}
              leftAvatar={{ source: { uri: config.getImage(item.img_url) } }}
              leftElement={
                <TouchableOpacity onPress={()=>{this.setState({approve_item:item});}} >
                  <Icon name='edit' size={30} color='#4caf50' underlayColor='#8bc34a' raised={true} />
                </TouchableOpacity>
              }
              onPress={()=>{
                navigation.navigate('Tìm Kiếm',{product:item});
              }}
              bottomDivider
            />
          )}
        />
        }
      </SearchBarATC>

      <Overlay isVisible={(!loading && approve_item && approve_item.id)?true:false} height='auto'>
        <ScrollView>
          <Text style={{textAlign:'center',fontWeight:"bold",fontSize:20,color:"#fb5b5a",marginBottom:20}}>
            DUYỆT SẢN PHẨM
          </Text>

          <View style={styles.center}>
            <TouchableOpacity onPress={()=>this.approveProduct(true)} style={[
              styles.roundBtn,styles.mt40,styles.bgsuccess,styles.w80p
              ]}>
              <Text style={styles.white}>Duyệt</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>this.approveProduct(false)}
              style={[styles.roundBtn,styles.bgred,styles.w80p]}>
              <Text style={styles.white}>Xóa</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.setState({ approve_item: {} })}
              style={[styles.roundBtn,styles.bginfo,styles.w80p]}>
              <Text style={styles.white}>ĐÓNG</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Overlay>
      {!is_scan &&
      <View>
        {show_action &&
        <View>
          <RoundButton onPress={this.getPermissionToken} icon='user-plus' bottom={80} />
          <RoundButton onPress={()=>this.setState({approve_status:!approve_status})}
            icon={approve_status?'calendar-plus-o':'calendar-minus-o'} bottom={144} />
        </View>
        }
        <RoundButton onPress={()=>this.setState({show_action:!show_action})}
          icon={show_action?'close':'plus'} bottom={show_action?208:16} />
      </View>
      }

      {loading &&
        <View style={{
          position:'absolute',top:0,left:0,backgroundColor:'#00000066',
          width:'100%',height:'100%',flex:1,justifyContent:'center',zIndex:10
        }}>
          <Text style={{
            textAlign:'center',backgroundColor:'#fff',borderRadius:10,
            marginHorizontal:10,paddingVertical:20,fontWeight:'bold',
          }}>Đang xử lý...</Text>
        </View>
      }
      {(permission_token?true:false) &&
      <Overlay isVisible={permission_token?true:false} height="auto">
        <View style={styles.center}>
          <Input
            label={'Token cấp phép tạo tài khoản'}
            labelStyle={{color:'#ffa184'}} containerStyle={{marginVertical:5}}
            value={permission_token}/>
          <TouchableOpacity onPress={()=>this.setState({permission_token:''})}
            style={[styles.roundBtn,styles.bginfo,styles.w80p]}>
            <Text style={styles.white}>ĐÓNG</Text>
          </TouchableOpacity>
        </View>
      </Overlay>
      }

    </View>
    );
  }
}

export default AdminTab;