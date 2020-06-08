import React from 'react';
import {View,FlatList,Alert,StatusBar,ScrollView,TouchableOpacity} from 'react-native';
import {Badge,Image,CheckBox,Overlay,Input,Text,ListItem} from 'react-native-elements';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import Icon from 'react-native-vector-icons/FontAwesome';

import config from '../../config.js';
import {parseForm,parseDate,crd2m} from '../../utils.js';
import { getUser,ROLE } from '../../models/model_utils.js';
import {styles} from '../styles/round_theme.js';
import DetailCard from './search_detail.js';
import SearchBarATC from './search_bar_atc.js';


class SearchTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',list:[],
      show_detail:false, show_timepicker:false,
      user_location:'',
      is_add: false, add_processing:false,
      add_data: {
        gtin_code:'',price:null,product_name:'',description:'',
        party_name:'',city:'',street_address_one:'',street_address_two:'',street_address_three:'',
        email:'',phone:''
      },
      image:null,
      store_product: {price:null,quantity:null,exp:''},
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
    if(store && store.location){
      this.setState({user_location:store.location});
    }
  }

  UNSAFE_componentWillReceiveProps(nxtProps){
    const oparams = this.props.route.params;
    const nparams = nxtProps.route.params;
    if( !oparams || (nparams && nparams.product
    ) ){
      if (nparams && nparams.product) {
        const {product} = nparams;
        this.setState({item:product,show_detail:true,});
      }
    }
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
    } catch (e) {Alert.alert('Lỗi','Vui lòng cấp quyền mở file!\n'+e);;}
  };

  handleResult = (item) => {
    if (!item) {
      this.setState({show_detail:false,item:{}});
    } else {
      this.setState({show_detail:true,item:item});
    }
  }
  fetchData = (search, fetchSuccess) => {
    const self = this;
    const params = {
      limit: 20,
      offset : 0,
      store_search:0,
      search : search,
    };
    fetch(config.getLocation('search/search_store_product/'), {
      headers: {'Content-Type': 'multipart/form-data',},
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
        const list = fetchSuccess(data);
        self.setState({list});
      }
    })
    .catch((error) => {
      fetchSuccess(null);
      self.setState({processing:false});
      Alert.alert("Lỗi", error.message,[{text: "OK", onPress: () => null}],{ cancelable: false });
    });
  }


  handleAddProduct = (is_add) => {
    let {user,tokens,item,store} = this.state;
    if(
      (item && item.gtin_code) &&
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
    this.setState({add_processing:true});
    const {item,add_data,store_product,image,tokens} = this.state;
    const maxs = config.max_size;
    const self = this;
    if(!item || (!item.store_product_id && !item.id)) {
      if(image && (image.width>maxs.width || image.height>maxs.height)) {
        Alert.alert("Lỗi", 'Kích thước ảnh không được vượt quá '+maxs.width+'x'+maxs.height+' pixel');
        this.setState({add_processing:false});
        return;
      }
      if(!add_data.product_name) {
        Alert.alert("Lỗi", 'Không được để trống tên sản phẩm');
        this.setState({add_processing:false});
        return;
      }
      let add_data_tmp = Object.assign({},add_data);
      for(let k in add_data_tmp) {if(add_data_tmp[k]=='') delete add_data_tmp[k];}
      if (add_data_tmp.gtin_code && add_data_tmp.gtin_code.length==13) {
        add_data_tmp.gtin_code='0'+add_data_tmp.gtin_code;
      }
        
      if(image && image.type && image.base64){
        add_data_tmp['image_base64'] = image.base64;
      }
      fetch(config.getLocation('search/add_product/'), {
        headers: {'Content-Type': 'multipart/form-data','Accept': "application/json"},
        method: 'POST', body: parseForm(add_data_tmp),
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
      let store_product_tmp = Object.assign({},store_product);
      for(let k in store_product_tmp) {if(store_product_tmp[k]=='') delete store_product_tmp[k];}
      store_product_tmp.exp = store_product_tmp.exp
        ?Math.floor(new Date(parseDate(store_product_tmp.exp,false)).getTime() / 1000)
        :Math.floor(new Date()/1000);
      store_product_tmp.id = item.store_id?item.product_id:item.id;
      fetch(config.getLocation('store/add_product/'), {
        headers: {'Content-Type': 'multipart/form-data','authorization': tokens.token,},
        method: 'POST', body: parseForm(store_product_tmp),
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
    const {add_data} = this.state;for (let k in o) { add_data[k] = o[k]; }this.setState({add_data});
  }
  setStoreProduct = (o) => {
    const {store_product} = this.state;
    for (let k in o) { store_product[k] = o[k]; }
    this.setState({store_product});
  }

  showStore = (item)=>{
    const {store} = this.state;
    if(!item.store_id || (store && store.storename)){return;}
    const params = {store_id:item.store_id};

    const self = this;
    fetch(config.getLocation('user_detail/store_detail/'), {
      headers: {
        'Content-Type': 'multipart/form-data','Accept': "application/json",
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
        self.navWithList({store:json.store,user:json.user, user_location:self.state.user_location});
      }
    })
    .catch((error) => {
      Alert.alert("Lỗi", error.message,[{text: "OK", onPress: () => null}],{ cancelable: false });
    });
  }
  navWithList = ({store, user, user_location}) => {
    const {navigation} = this.props;
  	const self = this;
  	if(!store.id){return;}

    const params = {
      limit: 20,offset : 0,store_search:1,store_id:store.id,search : '',
    };

    fetch(config.getLocation('search/search_store_product/'), {
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
        // self.setState({store_list:json.store_products.data});
        navigation.navigate('Cửa Hàng',{
          store,user,user_location,
          store_list:json.store_products.data
        });
      }
    })
    .catch((error) => {
      Alert.alert("Lỗi", error.message,[{text: "OK", onPress: () => null}],{ cancelable: false });
    });
  }
  handleSelectItem = (item)=>{
    this.setState({item});
  }

  render() {
    let {
      search,list,show_detail,item,user,
      is_scan,user_location,store,show_timepicker,
      is_add,other_data,add_data,store_product,tokens,image,add_processing
    } = this.state;
    const {realm} = this.props;

    return (
    <View style={{height:'100%'}}>
      <StatusBar backgroundColor="#ff9800" />
      {show_timepicker && (
        <DateTimePicker
          timeZoneOffsetInMinutes={ (-1)*(new Date()).getTimezoneOffset() }
          value={
            (!store_product || !store_product.exp
              || new Date(parseDate(store_product.exp, false))=='Invalid Date')
              ? new Date() : new Date(parseDate(store_product.exp, false))
          }
          mode='date' display="default" is24Hour={true}
          onChange={
            (e,d)=>{
              this.setState({show_timepicker:false});
              if(d) { this.setStoreProduct({exp:parseDate(d)}); }
            }
          }
        />
      )}

      <Overlay isVisible={is_add} fullScreen={true} overlayStyle={{padding:0}} animationType='fade'>
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
        {is_scan &&
          <SearchBarATC realm={realm}
            onChangeText={null} show_scan={true}
            get_all={false} reload={false}
            barcodeRecognized={(barcodes, is_scan)=> {
              this.setState({is_scan});
              this.setProduct({gtin_code:barcodes.data});
            } }
          />
        }
        {!is_scan &&
        <ScrollView style={{height:'100%'}}>
          {(item && (item.store_product_id||item.id) ) ?
            (<View>
              <Text style={{textAlign:'center',fontWeight:"bold",fontSize:20,color:"#fb5b5a",marginBottom:20}}>
                Thêm sản phẩm vào cửa hàng
              </Text>
              <Input
                label="Barcode" disabled

                inputStyle={styles.textBold}
                labelStyle={styles.orange} containerStyle={styles.mb5}
                value={item.gtin_code}
                />
              <Input
                label="Giá" placeholder="12000"
                labelStyle={styles.orange} containerStyle={styles.mb5}
                value={store_product.price}
                onChangeText={text => this.setStoreProduct({price:text})}/>
              <Input
                label="Số lượng" placeholder="100"
                labelStyle={styles.orange} containerStyle={styles.mb5}
                value={store_product.quantity}
                onChangeText={text => this.setStoreProduct({quantity:text})}/>
              <Input
                label="Hạn sử dụng" placeholder="dd/mm/yyyy"
                labelStyle={styles.orange} containerStyle={styles.mb5}
                value={store_product.exp}
                leftIcon={
                  <Icon name='calendar' size={40} color='tomato'
                    onPress={()=>this.setState({show_timepicker:true})} />
                }
                onChangeText={text => this.setStoreProduct({exp:text})}/>

              <View style={[styles.center,styles.mx2p]}>
                <TouchableOpacity onPress={this.addProduct} style={[
                  styles.roundBtn,styles.bgsuccess,styles.w100p,styles.mt40,
                  ]}>
                  <Text style={styles.white}>THÊM SẢN PHẨM</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.setState({ is_add: false })}
                  style={[styles.roundBtn,styles.bgred,styles.w100p]}>
                  <Text style={styles.white}>ĐÓNG</Text>
                </TouchableOpacity>
              </View>
            </View>)
            :(<View>
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
              <Input
                label="Tên công ty" placeholder="..."
                labelStyle={styles.orange} containerStyle={styles.mb5}
                value={add_data.party_name}
                onChangeText={text => this.setProduct({party_name:text})}/>

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

              <View style={[styles.center,styles.mx2p]}>
                <TouchableOpacity onPress={this.addProduct} style={[
                  styles.roundBtn,styles.bgsuccess,styles.w100p,styles.mt40
                  ]}>
                  <Text style={styles.white}>THÊM SẢN PHẨM</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.setState({ is_add: false })}
                  style={[styles.roundBtn,styles.bgred,styles.w100p]}>
                  <Text style={styles.white}>ĐÓNG</Text>
                </TouchableOpacity>
              </View>
            </View>)
          }
        </ScrollView>
        }
        </View>
      </Overlay>

      {!is_scan &&
      <View style={styles.fstRoundBtn}>
        <TouchableOpacity
        onPress={()=>this.handleAddProduct(true)}
        style={styles.roundBlueBtn}>
          <Icon name='plus' size={40} color='#fff' />
        </TouchableOpacity>
      </View>
      }

      {(show_detail) &&
        <DetailCard
          backPress={ ()=>this.setState({item:{},is_add:false,show_detail:false}) }
          handleSelectItem={this.handleSelectItem}
          item={item} suggest_list={list} store={store} showStore={this.showStore} user_location={user_location}
        >
          <View style={styles.fstRoundBtn}>
            <TouchableOpacity
            onPress={()=>this.handleAddProduct(true)}
            style={styles.roundBlueBtn}>
              <Icon name='plus' size={40} color='#fff' />
            </TouchableOpacity>
          </View>
        </DetailCard>
      }
      {(!show_detail) &&
      <SearchBarATC realm={realm} search={search}
        fetchData={this.fetchData} resultData={(list) => {this.setState({list}); }}
        get_all={false} reload={false} onChangeText={(search) => {
          this.setState({search});this.handleResult(null);
        }}
        barcodeRecognized={(barcodes, is_scan)=> {
          this.setState({is_scan});
        } }
      >
        {!is_scan && !(list && list.length>0) &&
        (
          <View style={{paddingTop: 5,}}>
            <Text style={{textAlign:'center',color:'#fff'}}>Không có kết quả.</Text>
          </View>
        )}
        {list && list.length>0 &&
        <FlatList
          keyExtractor={(item, index) => index.toString()} data={list}
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
                <Text style={{color:'#9e9e9e'}}>{item.gtin_code}</Text>
                {item.exp && <Text style={{color:'#9e9e9e'}}>EXP: {
                  (item.exp.length>10)?parseDate(item.exp.slice(0,10)):item.exp
                }</Text>}
                {item.storename && <Text style={{color:'#607d8b'}}>{item.storename}</Text>}
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
              bottomDivider chevron
              onPress={() => {this.handleResult(item);}}
            />
          )}
        />
        }
      </SearchBarATC>
      }
    </View>
    );
  }
}


export default SearchTab;