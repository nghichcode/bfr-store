import React from 'react';
import {ScrollView,Alert,View,FlatList,TouchableOpacity} from 'react-native';
import {Image,CheckBox,Text,ListItem,Overlay,Input,Tooltip} from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';

import {styles} from '../styles/round_theme.js';
import config from '../../config.js';
import {parseForm} from '../../utils.js';
import SearchBarATC from './search_bar_atc.js';
import {getUser} from '../../models/model_utils.js';
import {ROLE} from '../../models/models.js';

class RoundButton extends React.Component {
  render() {
    const {onPress, icon}=this.props;
    return (
      <TouchableOpacity activeOpacity={0.68} onPress={onPress}
      style={{
        alignItems:'center',justifyContent:'center',
        width:60,height:60,borderRadius:30,
        backgroundColor:'#3f51b5',
        shadowColor: '#000000',shadowOffset: { width: 10, height: 10 },
        elevation: 6,shadowOpacity: 1,shadowRadius: 6,marginTop:2
       }}>
        <Icon name={icon} size={30} color='#fff' />
      </TouchableOpacity>
    );
  }
}


class AdminTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,is_scan:false,
      edit_item:{},image:null,
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
      this.setState({loading:false});
      if(json.error) {
        Alert.alert("Lỗi", json.message+' : '+json.code,[{text: "OK"}],{ cancelable: false });
      } else {
        self.setState({
          list:list.filter((it) => { return it.id!=approve_item.id; }),
          approve_item:{}
        });
      }
    })
    .catch((error) => {
      this.setState({loading:false});
      Alert.alert("Lỗi", error.message,[{text: "OK", onPress: () => null}],{ cancelable: false });
    });
  }

  setProduct = (o) => {
    const {edit_item} = this.state;
    for (let k in o) { edit_item[k] = o[k]; }
    this.setState({edit_item});
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
    } catch (e) {Alert.alert('Lỗi','Vui lòng cấp quyền mở file!\n'+e);;}
  };

  editProduct = () => {
    const {edit_item,loading,image,tokens,user} = this.state;
    if(!this.isAdmin(tokens,user) || loading) { return; }
    this.setState({loading:true});
    const maxs = config.max_size;
    const self = this;

    if(image && (image.width>maxs.width || image.height>maxs.height)) {
      Alert.alert("Lỗi", 'Kích thước ảnh không được vượt quá '+maxs.width+'x'+maxs.height+' pixel');
      this.setState({loading:false});
      return;
    }
    if(!edit_item.product_name) {
      Alert.alert("Lỗi", 'Không được để trống tên sản phẩm');
      this.setState({loading:false});
      return;
    }
    let edit_item_tmp = Object.assign({},edit_item);
    for(let k in edit_item_tmp) {
      if( edit_item_tmp[k]=='' ) {delete edit_item_tmp[k];}
    }
    if(image && image.type && image.base64){
      edit_item_tmp['image_base64'] = image.base64;
    }
    fetch(config.getLocation('admin/update_product/'), {
      headers: {'Content-Type': 'multipart/form-data','Accept': "application/json",'authorization': tokens.token},
      method: 'POST', body: parseForm(edit_item_tmp),
    })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      self.setState({loading:false});
      if(json.error) {
        Alert.alert("Lỗi", json.message+' : '+json.code);
      } else {
        Alert.alert("Thông báo", "Sửa thành công");
        self.setState({edit_item:{}});
      }
    })
    .catch((error) => {
      self.setState({loading:false});
      Alert.alert("Lỗi", error.message,[{text: "OK", onPress: () => null}],{ cancelable: false });
    });

  }

  render() {
    const {navigation} = this.props;
    const {
      list,loading,permission_token,is_scan,approve_item,show_action,approve_status,other_data,
      image,edit_item
    } = this.state;
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
              subtitle={<View>
                <Text style={{color:'#9e9e9e'}}>{item.gtin_code}</Text>
                <Text style={{color:'#9e9e9e'}}>slug: {item.product_name_alpha}</Text>
              </View>}
              rightSubtitle={item.price}
              leftAvatar={{ source: { uri: config.getImage(item.img_url) } }}
              leftElement={
              <View>
                <TouchableOpacity onPress={()=>{this.setState({approve_item:item,edit_item:{}});}} >
                  <Icon name='check-square-o' size={30} color='#4caf50' underlayColor='#8bc34a' raised={true} />
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>{this.setState({approve_item:{},edit_item:item});}} >
                  <Icon name='edit' size={30} color='#4caf50' underlayColor='#8bc34a' raised={true} />
                </TouchableOpacity>
              </View>
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

      {((!loading && edit_item && edit_item.id)?true:false) &&
      <Overlay isVisible={(!loading && edit_item && edit_item.id)?true:false} height='auto' width='100%'>
        <ScrollView>
          <Text style={{textAlign:'center',fontWeight:"bold",fontSize:20,color:"#fb5b5a",marginBottom:20}}>
            Sửa sản phẩm
          </Text>
          <Input
            label="Barcode" placeholder="08087700764322" maxLength={14}
            labelStyle={styles.orange} containerStyle={styles.mb5}
            value={edit_item.gtin_code}
            onChangeText={text => this.setProduct({gtin_code:text})}/>
          <Input
            label="Giá" placeholder="12000"
            labelStyle={styles.orange} containerStyle={styles.mb5}
            value={edit_item.price}
            onChangeText={text => this.setProduct({price:text})}/>
          <Input
            label="Tên sản phẩm" placeholder="Mỳ tôm"
            labelStyle={styles.orange} containerStyle={styles.mb5}
            value={edit_item.product_name}
            onChangeText={text => this.setProduct({product_name:text})}/>
          <Input
            label="Ảnh" placeholder="..." disabled
            labelStyle={styles.orange} containerStyle={styles.mb5}
            value={(image &&image.type)?image.uri.split('/').pop():''}
            leftIcon={
              <Icon name='image' size={40} color='tomato' onPress={this._pickImage}/>
            }
            rightIcon={
              <Icon name='remove' size={40} color='tomato'
                onPress={()=>this.setState({image:null})}
              />
            }
            onChangeText={text => this.setProduct({product_name:text})}/>
          {image && image.uri &&
          <Image source={{uri:image.uri}}
            containerStyle={{height:300}}
            PlaceholderContent={
              <View style={{
                height:'100%',width:'100%', backgroundColor:'#bf9f94',
                justifyContent:'center',alignItems:'center'
              }}>
                <Text style={{textAlign:'center'}}>Không có ảnh</Text>
              </View>
            }
          />
          }
          <Input
            label="Mô tả" placeholder="..."
            labelStyle={styles.orange} containerStyle={styles.mb5}
            value={edit_item.description}
            onChangeText={text => this.setProduct({description:text})}/>

          <CheckBox
            title='Thông tin liên hệ'
            center iconRight checked={other_data}
            containerStyle={{backgroundColor:'#fff'}}
            onPress={() => this.setState({other_data:!other_data}) }
          />
          {other_data &&
          <View>
            <Input
              label="Email" placeholder="contact@nc.com"
              labelStyle={styles.orange} containerStyle={styles.mb5}
              value={edit_item.email=='null'?'':edit_item.email}
              onChangeText={text => this.setProduct({email:text})}/>
            <Input
              label="Số điện thoại" placeholder="..."
              labelStyle={styles.orange} containerStyle={styles.mb5}
              value={edit_item.phone=='null'?'':edit_item.phone}
              onChangeText={text => this.setProduct({phone:text})}/>
            <Input
              label="Tên công ty" placeholder="..."
              labelStyle={styles.orange} containerStyle={styles.mb5}
              value={edit_item.party_name=='null'?'':edit_item.party_name}
              onChangeText={text => this.setProduct({party_name:text})}/>
            <Input
              label="Thành phố" placeholder="..."
              labelStyle={styles.orange} containerStyle={styles.mb5}
              value={edit_item.city=='null'?'':edit_item.city}
              onChangeText={text => this.setProduct({city:text})}/>
            <Input
              label="Địa chỉ sản xuất 1" placeholder="..."
              labelStyle={styles.orange} containerStyle={styles.mb5}
              value={edit_item.street_address_one=='null'?'':edit_item.street_address_one}
              onChangeText={text => this.setProduct({street_address_one:text})}/>
            <Input
              label="Địa chỉ sản xuất 2" placeholder="..."
              labelStyle={styles.orange} containerStyle={styles.mb5}
              value={edit_item.street_address_two=='null'?'':edit_item.street_address_two}
              onChangeText={text => this.setProduct({street_address_two:text})}/>
            <Input
              label="Địa chỉ sản xuất 3" placeholder="..."
              labelStyle={styles.orange} containerStyle={styles.mb5}
              value={edit_item.street_address_two=='null'?'':edit_item.street_address_two}
              onChangeText={text => this.setProduct({street_address_three:text})}/>
            
          </View>
          }

          <View style={styles.center}>
            <TouchableOpacity onPress={this.editProduct} style={[
              styles.roundBtn,styles.mt40,styles.bgsuccess,styles.w80p
              ]}>
              <Text style={styles.white}>SỬA SẢN PHẨM</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.setState({ edit_item: {} })}
              style={[styles.roundBtn,styles.bgred,styles.w80p]}>
              <Text style={styles.white}>ĐÓNG</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Overlay>
      }

      {((!loading && approve_item && approve_item.id)?true:false) &&
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
      }

      {!is_scan &&
      <View style={{
        position:'absolute',right:16,bottom:show_action?80:16,alignItems:'center',justifyContent:'center',zIndex:9
      }}
      >
        <RoundButton onPress={()=>this.setState({show_action:!show_action})}
          icon={show_action?'close':'plus'}/>
        {show_action &&
        <View>
          <RoundButton onPress={this.getPermissionToken} icon='user-plus'/>
          <RoundButton onPress={()=>this.setState({approve_status:!approve_status})}
            icon={approve_status?'calendar-plus-o':'calendar-minus-o'}/>
        </View>
        }
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