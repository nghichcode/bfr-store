import React from 'react';
import {StyleSheet,View,FlatList,Alert,StatusBar,ScrollView,TouchableOpacity} from 'react-native';
import {Badge,Image,CheckBox,Overlay,Input,Text,Card,Button,SearchBar,ListItem} from 'react-native-elements';
import { Camera } from 'expo-camera';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';

import config from '../../config.js';
import {parseForm,parseDate,crd2m} from '../../utils.js';
import { getUser,ROLE } from '../../models/model_utils.js';


class SearchTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '', has_route: false,
      hideResult:false, show_timepicker:false,
      user_location:'',
      is_add: false,
      add_processing:false,
      add_data: {
        gtin_code:'',price:'',product_name:'',description:'',
        party_name:'',city:'',street_address_one:'',street_address_two:'',street_address_three:'',
        email:'',phone:''
      },
      image:null,
      store_data: {
        price:'',quantity:'',exp:''
      },
      other_data:false,
      is_scan:false,
      user:null, store:null, tokens:null,
      item:{},
    };
  }
  componentDidMount() {
    this.getPermissionAsync();
    const {user,store,tokens} = getUser(this.props.realm);
    this.setState({user,store,tokens});
  }
  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        Alert.alert('Lỗi','Chưa được cấp quyền sử dụng camera!');
      }
    }
  };
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
    } catch (e) {console.log(e);}
  };

  updateSearch = (search) => {
    // console.log('search.js:70',search);
    if(!this.state.has_route){ this.setState({has_route:true}); }
    this.setState({search, item:{}});
  }

  handleResult = (item,user_location='') => {
    if (!item) {
      this.setState({hideResult:false,item:{}});
    } else {
      item.exp = (item.exp && item.exp.length>10)?parseDate(item.exp.slice(0,10)):item.exp;
      this.setState({hideResult:true,item:item,user_location});
    }
  }
  handleBarcode = (is_scan,search) => {
    this.setState({is_scan});
    if (search) { this.setProduct({gtin_code:search}); }
  }
  handleAddProduct = (is_add) => {
    const {user,tokens,item,store} = this.state;
    if(
      (item && item.id) &&
      ( !tokens || !tokens.refresh_token || (user.permission_id!=ROLE['user']) )
      
    ) {
      Alert.alert(
        "Lỗi", "Không thể tạo sản phẩm mới từ sản phẩm này. "+
        "Vui lòng đóng kết quả tìm kiếm nếu muốn tạo sản phẩm mới."
        ,[{text: "OK", onPress: () => null}],{ cancelable: false }
      );
    } else {
      this.setState({is_add});
    }
  }
  addProduct = () => {
    const {item,add_data,store_data,image} = this.state;
    const maxs = config.max_size;
    if(!image || image.width>maxs.width || image.height>maxs.height) {
      Alert.alert("Lỗi", 'Kích thước ảnh không được vượt quá '+maxs.width+'x'+maxs.height+' pixel',
        [{text: "OK"}],{ cancelable: false }
      );
      return;
    }
    this.setState({add_processing:true});
    const self = this;
    const old_exp = add_data.exp;
    add_data.exp = add_data.exp
      ?Math.floor(new Date(parseDate(add_data.exp,false)).getTime() / 1000):Math.floor(new Date()/1000);
    if(!item || !item.id) {
      for(let k in add_data) {
        if(add_data[k]=='') delete add_data[k];
        if (k=='gtin_code' && add_data[k] && add_data[k].length==13) {
          add_data[k]='0'+add_data[k];
          this.setState({add_data});
        }
      }
      if(image && image.type && image.base64){
        add_data['image_base64'] = image.base64;
      }
      fetch(config.getLocation('search/add_product/'), {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': "application/json"
        },
        method: 'POST',
        body: parseForm(add_data),
      })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        self.setState({add_processing:false});
        if(json.error) {
          Alert.alert("Lỗi", json.message+' : '+json.code,[{text: "OK"}],{ cancelable: false });
        } else {
          Alert.alert("Thông báo", "Thêm thành công",[{text: "OK"}],{ cancelable: false });
          self.setState({is_add:false});
        }
      })
      .catch((error) => {
        self.setState({add_processing:false});
        Alert.alert("Lỗi", error.message,[{text: "OK", onPress: () => null}],{ cancelable: false });
      });
    } else {
      for(let k in store_data) {
        if(store_data[k]=='') delete store_data[k];
      }
      store_data['id'] = item.store_id?item.product_id:item.id;
      // console.log('search.js:39',store_data);

      const {tokens} = this.state;
      fetch(config.getLocation('store/add_product/'), {
        headers: {
          'Content-Type': 'multipart/form-data',
          'authorization': tokens.token,
        },
        method: 'POST',
        body: parseForm(store_data),
      })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        self.setState({add_processing:false});
        if(json.error) {
          Alert.alert("Lỗi", json.message+' : '+json.code,[{text: "OK"}],{ cancelable: false });
        } else {
          Alert.alert("Thông báo", "Thêm thành công",[{text: "OK"}],{ cancelable: false });
          self.setState({is_add:false});
        }
      })
      .catch((error) => {
        self.setState({add_processing:false});
        Alert.alert("Lỗi", error.message,[{text: "OK", onPress: () => null}],{ cancelable: false });
      });

    }
  }
  setProduct = (o) => {
    const {add_data} = this.state;
    for (var k in o) { add_data[k] = o[k]; }
    this.setState({add_data});
  }
  setStoreProduct = (o) => {
    const {store_data} = this.state;
    for (var k in o) { store_data[k] = o[k]; }
    this.setState({store_data});
  }

  showStore = (item)=>{
    const {navigation} = this.props;
    const {store} = this.state;
    if(!item.store_id || (store && store.storename)){return;}
    const params = {store_id:item.store_id};

    const self = this;
    fetch(config.getLocation('userdetail/store_detail/'), {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': "application/json",
      },
      method: 'POST',
      body: parseForm(params),
    })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      if(json.error) {
        Alert.alert("Lỗi", json.message+' : '+json.code,[{text: "OK"}],{ cancelable: false });
      } else {
        navigation.navigate('Cửa Hàng',{store:json.store,user:json.user, user_location:self.state.user_location});
      }
    })
    .catch((error) => {
      Alert.alert("Lỗi", error.message,[{text: "OK", onPress: () => null}],{ cancelable: false });
    });
  }

  render() {
    let {
      search,hideResult,item,has_route,user,
      is_scan,user_location,store,show_timepicker,
      is_add,other_data,add_data,store_data,tokens,image,add_processing
    } = this.state;
    const hasContact = item.city && item.street_address_one && item.street_address_two
     && item.street_address_three && item.email && item.phone;
    const {route,realm} = this.props;
    if( !has_route && ( !item || !item.product_name) && route && route.params){
      const {product} = route.params;
      search = product.product_name;
      hideResult = true;
      item = product;
      item.exp = (item.exp && item.exp.length>10)?parseDate(item.exp.slice(0,10)):item.exp;
    }

    return (
      <View style={{height:'100%'}}>
        <StatusBar backgroundColor="#ff9800" />
        {show_timepicker && (
          <DateTimePicker
            timeZoneOffsetInMinutes={ (-1)*(new Date()).getTimezoneOffset() }
            value={
              (!store_data || !store_data.exp
                || new Date(parseDate(store_data.exp, false))=='Invalid Date')
                ? new Date() : new Date(parseDate(store_data.exp, false))
            }
            mode='date'
            display="default"
            is24Hour={true}
            onChange={
              (e,d)=>{
                this.setState({show_timepicker:false});
                if(d) { this.setStoreProduct({exp:parseDate(d)}); }
              }
            }
          />
        )}

        <Overlay isVisible={is_add} fullScreen={true}
        >
        <View style={{height:'100%'}}>
        {add_processing &&
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
        {!is_scan && (item && item.id) &&
          <ScrollView>
            <Text style={{textAlign:'center',fontWeight:"bold",fontSize:20,color:"#fb5b5a",marginBottom:20}}>
              Thêm sản phẩm vào cửa hàng
            </Text>
            <Input
              label="Barcode"
              disabled
              labelStyle={styles.orange} containerStyle={styles.mb5}
              value={item.gtin_code}/>
            <Input
              label="Giá" placeholder="12000"
              labelStyle={styles.orange} containerStyle={styles.mb5}
              value={store_data.price}
              onChangeText={text => this.setStoreProduct({price:text})}/>
            <Input
              label="Số lượng" placeholder="100"
              labelStyle={styles.orange} containerStyle={styles.mb5}
              value={store_data.quantity}
              onChangeText={text => this.setStoreProduct({quantity:text})}/>
            <Input
              label="Hạn sử dụng" placeholder="dd/mm/yyyy"
              labelStyle={styles.orange} containerStyle={styles.mb5}
              value={store_data.exp}
              leftIcon={
                <Icon name='calendar' size={40} color='tomato'
                  onPress={()=>this.setState({show_timepicker:true})} />
              }
              onChangeText={text => this.setStoreProduct({exp:text})}/>

            <View style={styles.center}>
              <TouchableOpacity onPress={this.addProduct} style={[
                styles.loginBtn,styles.mt40,styles.success,styles.w80p
                ]}>
                <Text style={styles.white}>THÊM SẢN PHẨM</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.setState({ is_add: false })}
                style={[styles.loginBtn,styles.bgred,styles.w80p]}>
                <Text style={styles.white}>ĐÓNG</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        }
        {!is_scan && (!item || !item.id) &&
          <ScrollView>
            <Text style={{textAlign:'center',fontWeight:"bold",fontSize:20,color:"#fb5b5a",marginBottom:20}}>
              Thêm sản phẩm
            </Text>
            <Input
              label="Barcode" placeholder="08087700764322" maxLength={14}
              labelStyle={styles.orange} containerStyle={styles.mb5}
              value={add_data.gtin_code}
              rightIcon={
                <Icon name='qrcode' size={40} color='gray'
                  onPress={()=>this.setState({is_scan:true})}
                />
              }
              onChangeText={text => this.setProduct({gtin_code:text})}/>
            <Input
              label="Giá" placeholder="12000"
              labelStyle={styles.orange} containerStyle={styles.mb5}
              value={add_data.price}
              onChangeText={text => this.setProduct({price:text})}/>
            <Input
              label="Tên sản phẩm" placeholder="Mỳ tôm"
              labelStyle={styles.orange} containerStyle={styles.mb5}
              value={add_data.product_name}
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
              value={add_data.description}
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
                value={add_data.email}
                onChangeText={text => this.setProduct({email:text})}/>
              <Input
                label="Số điện thoại" placeholder="..."
                labelStyle={styles.orange} containerStyle={styles.mb5}
                value={add_data.phone}
                onChangeText={text => this.setProduct({phone:text})}/>
              <Input
                label="Tên công ty" placeholder="..."
                labelStyle={styles.orange} containerStyle={styles.mb5}
                value={add_data.party_name}
                onChangeText={text => this.setProduct({party_name:text})}/>
              <Input
                label="Thành phố" placeholder="..."
                labelStyle={styles.orange} containerStyle={styles.mb5}
                value={add_data.city}
                onChangeText={text => this.setProduct({city:text})}/>
              <Input
                label="Địa chỉ sản xuất 1" placeholder="..."
                labelStyle={styles.orange} containerStyle={styles.mb5}
                value={add_data.street_address_one}
                onChangeText={text => this.setProduct({street_address_one:text})}/>
              <Input
                label="Địa chỉ sản xuất 2" placeholder="..."
                labelStyle={styles.orange} containerStyle={styles.mb5}
                value={add_data.street_address_two}
                onChangeText={text => this.setProduct({street_address_two:text})}/>
              <Input
                label="Địa chỉ sản xuất 3" placeholder="..."
                labelStyle={styles.orange} containerStyle={styles.mb5}
                value={add_data.street_address_three}
                onChangeText={text => this.setProduct({street_address_three:text})}/>
              
            </View>
            }

            <View style={styles.center}>
              <TouchableOpacity onPress={this.addProduct} style={[
                styles.loginBtn,styles.mt40,styles.success,styles.w80p
                ]}>
                <Text style={styles.white}>THÊM SẢN PHẨM</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.setState({ is_add: false })}
                style={[styles.loginBtn,styles.bgred,styles.w80p]}>
                <Text style={styles.white}>ĐÓNG</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        }
        {is_scan &&
        <SearchBarATC realm={realm}
          onChangeText={null} handleResult={()=>null}
          handleBarcode={this.handleBarcode} show_scan={is_scan}
        />
        }
        </View>
        </Overlay>

        <View style={{
          position:'absolute',right:16,bottom:16,alignItems:'center',justifyContent:'center',zIndex:9
        }}
        >
          <TouchableOpacity
          onPress={()=>this.handleAddProduct(true)}
          style={{
            alignItems:'center',justifyContent:'center',
            width:60,height:60,borderRadius:30,
            backgroundColor:'#3f51b5',
            shadowColor: '#000000',shadowOffset:  { width: 10, height: 10 },
            elevation: 6,shadowOpacity: 1,shadowRadius: 6,
           }}>
            <Icon name='plus' size={40} color='#fff' />
          </TouchableOpacity>
        </View>

        <SearchBarATC realm={realm}
          onChangeText={this.updateSearch} handleResult={this.handleResult}
          handleBarcode={this.handleBarcode}
        />
        {search==='' && !is_scan &&
        (
          <View style={{paddingTop: 5,}}>
            <Text style={{textAlign:'center'}}>Chưa có kết quả.</Text>
          </View>
        )}
        {search!=='' && !is_scan && hideResult && item.product_name && (
        <ScrollView style={{position:'absolute',top:60,left:0,right:0,bottom:0}}>
          <Card
            title={item.product_name}
            image={{uri: config.getImage(item.img_url)}}
            imageProps={{
              resizeMode:'contain',
              containerStyle:{height:300},
              PlaceholderContent:(
                <View style={{
                  height:'100%',width:'100%', backgroundColor:'#bf9f94',
                  justifyContent:'center',alignItems:'center'
                }}>
                  <Text style={{textAlign:'center'}}>Không có ảnh</Text>
                </View>
              )
            }}
            containerStyle={{marginBottom:8}}
          >
            <View style={{marginHorizontal:8}}>

              <View style={{marginBottom:10}}>
                <Text style={styles.textc20}>Thông tin sản phẩm</Text>
              </View>
              <View style={styles.cards_list}>
                <View style={{flex:1,flexDirection:'row',}}>
                  <View style={styles.card_row}>
                    <View style={styles.card}>
                      <View style={{flexDirection: 'row',justifyContent:'center',alignItems: 'center'}}>
                        <Icon name='dollar' size={20} color='#ffffff'/>
                        <Text style={{color:'#ffffff',marginLeft:4}}>{item.price}</Text>
                      </View>
                      <Text style={{textAlign:'center',color:'#ffffff'}}>Giá</Text>
                    </View>
                  </View>
                  <View style={styles.card_row}>
                    <View style={styles.card}>
                      {item.store_id &&
                      <View style={{flexDirection: 'row',justifyContent:'center',alignItems: 'center'}}>
                        <Icon name='road' size={20} color='#ffffff'/>
                        <Text style={{color:'#ffffff',marginLeft:4}}>{
                          !user_location
                          ?'Không rõ'
                          :item.location
                            ?crd2m(user_location, item.location)+'m'
                            :'Không rõ'
                        }</Text>
                      </View>
                      }
                      {!item.store_id &&
                      <View style={{flexDirection: 'row',justifyContent:'center',alignItems: 'center'}}>
                        <Icon name='shield' size={20} color='#ffffff'/>
                        <Text style={{color:'#ffffff',marginLeft:4}}>Sản phẩm gốc</Text>
                      </View>
                      }
                      <Text style={{textAlign:'center',color:'#ffffff'}}>{item.store_id?'Khoảng cách':''}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.card_row}>
                  <View style={styles.card}>
                    <View style={{flexDirection: 'row',justifyContent:'center',alignItems: 'center'}}>
                      <Icon name='barcode' size={20} color='#ffffff'/>
                      <Text style={{color:'#ffffff',marginLeft:4}}>{item.gtin_code}</Text>
                    </View>
                    <Text style={{textAlign:'center',color:'#ffffff'}}>Barcode</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cards_list}>
                <View style={styles.card_row}>
                  <View style={styles.card}>
                      <Text style={[styles.textWhite,styles.textBold]}>Mô tả:</Text>
                      <Text style={styles.textWhite}>{item.description}</Text>
                  </View>
                </View>
                <View style={styles.card_row}>
                  <View style={styles.card}>
                    <Text style={[styles.textWhite,styles.textBold]}>Nơi sản xuất:</Text>
                    <Text style={styles.textWhite}>{item.party_name}</Text>
                  </View>
                </View>
              </View>

              {item.store_id &&
              <View>
                <View style={{marginBottom:10}}>
                  <Text style={styles.textc20}>Thông tin cửa hàng</Text>
                </View>
                <View style={styles.cards_list}>
                  <View style={styles.card_row}>
                    <TouchableOpacity style={styles.card} activeOpacity={0.68}
                      onPress={()=>{this.showStore(item);}}
                    >
                      <View style={{flexDirection: 'row',justifyContent:'center',alignItems: 'center'}}>
                        {(!(store && store.storename)) &&
                        <Icon name='info-circle' size={20} color='#ffffff'
                          style={{position:'absolute',top:0,right:0}}
                        />
                        }
                        <Icon name='home' size={20} color='#ffffff'/>
                        <Text style={{color:'#ffffff',marginLeft:4}}>
                          {item.storename}
                        </Text>
                      </View>
                      <Text style={{textAlign:'center',color:'#ffffff'}}>Tên cửa hàng</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{flex:1,flexDirection:'row',}}>
                    <View style={styles.card_row}>
                      <View style={styles.card}>
                        <View style={{flexDirection: 'row',justifyContent:'center',alignItems: 'center'}}>
                          <Icon name='table' size={20} color='#ffffff'/>
                          <Text style={{color:'#ffffff',marginLeft:4}}>{item.quantity}</Text>
                        </View>
                        <Text style={{textAlign:'center',color:'#ffffff'}}>Số lượng</Text>
                      </View>
                    </View>
                    <View style={styles.card_row}>
                      <View style={styles.card}>
                        <View style={{flexDirection: 'row',justifyContent:'center',alignItems: 'center'}}>
                          <Ionicons name='ios-timer' size={20} color='#ffffff'/>
                          <Text style={{color:'#ffffff',marginLeft:4}}>{
                            item.exp?item.exp:''
                          }</Text>
                        </View>
                        <Text style={{textAlign:'center',color:'#ffffff'}}>Ngày hết hạn</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              }

              {hasContact &&
              <View style={{marginBottom:10}}>
                <Text style={styles.textc20}>Thông tin liên hệ</Text>
              </View>
              }
              {hasContact &&
              <View style={styles.cards_list}>
                <View style={styles.card_row}>
                  <View style={styles.card}>
                    {item.city && <View>
                      <Text style={[styles.textWhite,styles.textBold]}>Thành phố:</Text>
                      <Text style={styles.textWhite}>{item.city}</Text>
                    </View>}
                    {item.street_address_one && <View>
                      <Text style={[styles.textWhite,styles.textBold]}>Địa chỉ sản xuất 1:</Text>
                      <Text style={styles.textWhite}>{item.street_address_one}</Text>
                    </View>}
                    {item.street_address_two && <View>
                      <Text style={[styles.textWhite,styles.textBold]}>Địa chỉ sản xuất 2:</Text>
                      <Text style={styles.textWhite}>{item.street_address_two}</Text>
                    </View>}
                    {item.street_address_three && <View>
                      <Text style={[styles.textWhite,styles.textBold]}>Địa chỉ sản xuất 3:</Text>
                      <Text style={styles.textWhite}>{item.street_address_three}</Text>
                    </View>}
                    {item.email && <View>
                      <Text style={[styles.textWhite,styles.textBold]}>Email:</Text>
                      <Text style={styles.textWhite}>{item.email}</Text>
                    </View>}
                    {item.phone && <View>
                      <Text style={[styles.textWhite,styles.textBold]}>Số điện thoại:</Text>
                      <Text style={styles.textWhite}>{item.phone}</Text>
                    </View>}
                  </View>
                </View>
              </View>
              }

            </View>
          </Card>
        </ScrollView>
        )}
      </View>
    );
  }
}

class SearchBarATC extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      isEmpty: true,
      hideResult:true,
      is_scan:false,
      hasCameraPermission:null,
      user_location:'',
      flash:false,
      count_text: 0,
      list: []
    };
  }

  async componentDidMount() {
    this.mounted = true;
    if(this.mounted) {
      const { status } = await Camera.requestPermissionsAsync();
      this.setState({ hasCameraPermission: status === 'granted' });
      this.setLocation();
    }
  }
  componentWillUnmount(){
    this.mounted = false;
  }

  setLocation = () => {
    const {store} = getUser(this.props.realm);
    if(store && store.location){
      this.setState({user_location:store.location});
    }
  }

  onChangeText = text => {
    const {onChangeText,handleResult,store_search} = this.props;
    const self = this;
    if(!onChangeText || !handleResult){return;}
    onChangeText(text);
    if(!this.state.user_location){this.setLocation();}
    const count = text.split(' ').filter((it)=>it).length;
    if(!text) {
      this.setState({ isEmpty: text === '',search: text,hideResult:true,count_text:count });
      return;
    }

    const {search,list,count_text} = this.state;
    if(count>count_text && search && text.includes(search)) {
      // console.log('search.js:1!',count,count_text, search);
      this.setState({
        isEmpty: text === '',search: text,hideResult:false,
        list: list.filter((it) => { return it.product_name.includes(text)||it.gtin_code.includes(text); })
      });
      handleResult(null);
      return;
    }

    this.setState({isEmpty: text === '',search: text,hideResult:false});
    handleResult(null);
    if ( count!=count_text ) {
      // console.log('search.js:2',count,count_text, search, text);
      this.setState({count_text:count});
      const params = {
        limit: 100,
        offset : 0,
        store_search:0,
        search : text,
      };
      fetch(config.getLocation('search/search_store_product/'), {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        method: 'POST',
        body: parseForm(params),
      })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        if(json.error) {
          Alert.alert("Lỗi", json.message+' : '+json.code,[{text: "OK"}],{ cancelable: false });
        } else {
          var data = [];
          data = data.concat(json.store_products?json.store_products.data:[]);
          data = data.concat(json.products?json.products.data:[]);
          self.setState({list:data});
        }
      })
      .catch((error) => {
        self.setState({processing:false});
        Alert.alert("Lỗi", error.message,[{text: "OK", onPress: () => null}],{ cancelable: false });
      });
    }
  };

  barcodeRecognized = (barcodes, is_scan=false) => {
    if(barcodes) {
      this.onChangeText(barcodes.data);
    }
    this.props.handleBarcode(is_scan,barcodes?barcodes.data:'');
    this.setState({is_scan});
  }

  handleResult = (item) => {
    this.setState({hideResult:true});
    this.props.handleResult(item, this.state.user_location);
  }

  render() {
    const {search,isEmpty,hideResult,is_scan,flash,user_location} = this.state;
    const {handleResult,show_scan} = this.props;

    if (is_scan || show_scan) {
      return(
        <View style={{height:'100%'}}>
          <Camera style={{height:'100%',width: '100%',}}
            type={Camera.Constants.Type.back}
            flashMode={flash?Camera.Constants.FlashMode.torch:Camera.Constants.FlashMode.off}
            onBarCodeScanned={ this.barcodeRecognized }>
              <View 
              style={{marginBottom:10, display:'flex',flex:1,flexDirection:'column-reverse',alignItems:'center'}}
              >
                <View style={{flex:0,flexDirection:'row', marginBottom:4}}>
                  <Button
                    title='Đóng'
                    onPress={()=>{this.barcodeRecognized(false);}}
                    containerStyle={{
                      flex:3,marginHorizontal: '5%',
                    }}
                    buttonStyle={{height:40,}}
                  />
                  <Button
                    title='' icon={<Ionicons name='ios-flash' size={20} color='#fff'/>}
                    onPress={()=>{this.setState({flash:!flash});}}
                    containerStyle={{
                      flex:0,marginHorizontal: '5%',
                    }}
                    buttonStyle={{
                      height:40,padding:0, margin:0,width:40
                    }}
                  />
                </View>
              </View>
          </Camera>

        </View>
      );
    }

    return (
    <View style={{backgroundColor: '#f44336cc', height:isEmpty || hideResult?'auto':'100%'}}>
      <View style={{height: 60}}>
        <View style={{width: '90%'}}>
          <SearchBar
            lightTheme={true}
            placeholder="Type Here..."
            containerStyle={{
              backgroundColor: '#fff',borderTopWidth: 1,borderBottomWidth: 1,
              borderBottomColor: '#ddd',borderTopColor: '#ddd',
            }}
            inputContainerStyle={{backgroundColor: '#eee',height:'100%'}}
            onChangeText={this.onChangeText}
            value={search}
          />
        </View>
        <View style={{
          position: 'absolute',right: 0, top: 0, width: '10%', height: '100%',
          flex: 1,flexDirection: 'row',justifyContent: 'center',alignItems: 'center',
          backgroundColor: '#fff',borderTopWidth: 1,borderBottomWidth: 1,
          borderBottomColor: '#ddd',borderTopColor: '#ddd',
        }}>
          <View style={{padding:0, margin:0,marginRight:6}} >
            <Icon name='qrcode' size={40} color='gray'
              onPress={()=>{this.barcodeRecognized(null,true);}}
            />
          </View>
        </View>
      </View>
      { !isEmpty && !hideResult &&
      (
        <View style={{position:'absolute',top:60,left:0,right:0,bottom:0}}>
        <FlatList
          initialNumToRender={this.state.list.length}
          keyExtractor={(item, index) => index.toString()}
          data={this.state.list}
          renderItem={({ item, index }) => (
            <ListItem
              title={item.product_name}
              rightTitle={
                <Text>
                  {item.is_approved>0 && <Icon name='check' size={10} color='tomato'/>}
                  {item.is_trusted>0 && <Icon name='star' size={10} color='tomato'/>}
                </Text>
              }
              subtitle={<View>
                <Text style={{color:'#607d8b'}}>{item.storename}</Text>
                <Text style={{color:'#9e9e9e'}}>{item.gtin_code}</Text>
              </View>}
              rightSubtitle={<View>
                <Text style={{color:'#9e9e9e'}}>{item.price}</Text>
                <Badge value={
                  (
                  !user_location
                  ? ( (item.store_id) ? 'Không rõ' : 'SP gốc' )
                  :item.location
                    ?crd2m(user_location, item.location)+'m'
                    :item.store_id?'Không rõ':'SP gốc'
                  )
                } status="error" />
              </View>}
              leftAvatar={{ source: { uri: config.getImage(item.img_url) } }}
              bottomDivider
              chevron
              onPress={() => {this.handleResult(item);}}
            />
          )}
        />
        </View>
      )
      }
    </View>
    );
  }
}

const styles = StyleSheet.create({
  cards_list : {
    zIndex: 0,
    marginBottom: 10,
    display: 'flex',
    justifyContent: 'space-around',
    backgroundColor:'#fff',
  },
  card_row : {flex:1,marginHorizontal: 4},
  card : {
    alignSelf:'center',
    marginBottom: 10,
    padding: 10,
    width: '100%',
    height: 'auto',
    borderWidth: 0,
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset:  { width: 20, height: 20 },
    elevation: 10,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    backgroundColor:'#ff5722',
  },
  textc20: {fontSize:20,textAlign:'center'},
  textWhite: {color:'#fff'},
  textBold: {fontWeight:'bold'},
  // ADD
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
  bginfo: {backgroundColor:"#00bcd4",},
  bgwarning: {backgroundColor:"#ff9800",},
  white: {color:"#ffffff"},
  center:{alignItems:'center',textAlign:'center'},
});

export {
  SearchBarATC, styles
};
export default SearchTab;