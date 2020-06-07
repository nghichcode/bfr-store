import React from 'react';

import {Alert, View, Text, FlatList, TouchableOpacity} from 'react-native';
import {ListItem, Overlay, Input} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

import {styles} from '../styles/round_theme.js';
import config from '../../config.js';
import {parseForm,parseDate,crd2m} from '../../utils.js';
import SearchBarATC from './search_bar_atc.js';
import {getUser} from '../../models/model_utils.js';

class CalculateTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,is_scan:false,
      list: [],user:{},tokens:{},sell_list:[],
    };
  }

  componentDidMount() {
    this.mounted = true;
    if(this.mounted) {
      const {user,tokens} = getUser(this.props.realm);
      this.setState({user,tokens});
    }
  }
  componentWillUnmount(){this.mounted = false;}

  fetchData = (search, fetchSuccess) => {
    const {tokens,user} = this.state;
    const self = this;

    const params = {
      limit: 100,
      offset : 0,
      store_search:1,
      search : search,
    };

    fetch(config.getLocation('search/search_store_product/'), {
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
        Alert.alert("Lỗi", json.message+' : '+json.code,[{text: "OK"}],{ cancelable: false });
      } else {
        const list = fetchSuccess(json.store_products.data);
        self.setState({list});
      }
    })
    .catch((error) => {
      Alert.alert("Lỗi", error.message,[{text: "OK", onPress: () => null}],{ cancelable: false });
    });
  }

  insertList = (item) => {
    item.sold_out = 1;
    const self = this;
    const {list,sell_list} = this.state;
    // item.exp = (item.exp && item.exp.length>10)?parseDate(item.exp.slice(0,10)):item.exp;
    if(sell_list.find(it=>it.store_product_id==item.store_product_id)){
      Alert.alert("Lỗi", "Sản phẩm đã tồn tại.");return;
    }
    this.setState({list:[], sell_list:[...sell_list, item]});
  }
  updateList = (item, sold_out, remove=false) => {
    if(isNaN(item.sold_out)||isNaN(sold_out)){return;}
    const {sell_list} = this.state;
    item.sold_out = (typeof sold_out == 'string') ? parseInt(!sold_out?0:sold_out):sold_out;
    if(!remove && item.sold_out<0){item.sold_out=0;}
    if (item.sold_out>item.quantity) {item.sold_out=item.quantity;}
    const sell_list_tmp = [];
    for (let i = 0; i < sell_list.length; i++) {
      if(sell_list[i].store_product_id==item.store_product_id){
        if(item.sold_out>=0){sell_list_tmp.push(item);}
      } else {sell_list_tmp.push(sell_list[i]);}
    }
    // this.setState({sell_list:sell_list.map((it)=>it.store_product_id==item.store_product_id?item:it) });
    this.setState({sell_list:sell_list_tmp});
  }

  handleSold = () => {
    const self = this;
    this.setState({loading:true});
    const {tokens,user,sell_list} = this.state;
    let sell_list_tmp = [];
    for (let i = 0; i < sell_list.length; i++) {
      let sold = sell_list[i];
      if(sold.sold_out>0 && sold.sold_out<=sold.quantity) {
        sell_list_tmp.push({
          sold_id:sold.store_product_id, sold_quantity:sold.quantity-sold.sold_out,
        });
      }
      // return {sold_id:it.store_product_id,sold_quantity:it.sold_out};
    }

    const params = {
      json: JSON.stringify(sell_list_tmp)
    };
    console.log('p::',params);

    fetch(config.getLocation('store/update_list_product/'), {
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
        Alert.alert("Lỗi", json.message+' : '+json.code);
      } else {
        Alert.alert("Thông báo", "Thực hiện thành công.");
        self.setState({sell_list:[]});
      }
    })
    .catch((error) => {
      this.setState({loading:false});
      Alert.alert("Lỗi", error.message,[{text: "OK", onPress: () => null}],{ cancelable: false });
    });
  }

  render() {
    const {list,sell_list,loading,is_scan} = this.state;
    const total_amount = sell_list.reduce((a, it)=>{return a+(isNaN(it.price)?0:parseInt(it.price)*it.sold_out);}, 0);
    return (//STORE
    <View>
      <SearchBarATC
        fetchData={this.fetchData} resultData={(list) => {this.setState({list});}}
        get_all={false} reload={false}
        barcodeRecognized={(barcodes, is_scan)=>this.setState({is_scan})}
      >
        {list.length>0 &&
        <FlatList
          initialNumToRender={list.length}
          keyExtractor={(item, index) => index.toString()}
          data={list}
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
                <Text style={{color:'#9e9e9e'}}>Số lượng: {item.quantity}</Text>
              </View>}
              rightSubtitle={item.price}
              leftAvatar={{ source: { uri: config.getImage(item.img_url) } }}
              onPress={()=>this.insertList(item)}
              bottomDivider
            />
          )}
        />
        }

        {list.length<=0 && sell_list.length>0 &&
        <View>
        <FlatList
          initialNumToRender={sell_list.length}
          keyExtractor={(item, index) => index.toString()}
          data={sell_list}
          renderItem={({ item, index }) => (
            <ListItem title={item.product_name}
              rightElement={
              <View>
                <TouchableOpacity onPress={()=>this.updateList(item,item.sold_out+1)}
                  style={[styles.roundCornerBtn,styles.bgsuccess,styles.mb2]}>
                  <Icon name='plus' size={20} color='#fff' />
                </TouchableOpacity>
                <Input inputContainerStyle={styles.roundCornerInp}
                  containerStyle={{paddingHorizontal:0}}
                  inputStyle={{paddingVertical:0}} lineHeight={28}
                  textAlign='center' value={item.sold_out.toString()}
                  onChangeText={(text)=>this.updateList(item,text)}
                />
                <TouchableOpacity onPress={()=>this.updateList(item,item.sold_out-1)}
                  style={[styles.roundCornerBtn,styles.bgsuccess,styles.mt2]}>
                  <Icon name='minus' size={20} color='#fff' />
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>this.updateList(item,-1,true)}
                  style={[styles.roundCornerBtn,styles.bgred,styles.mt2]}>
                  <Icon name='remove' size={20} color='#fff' />
                </TouchableOpacity>
              </View>
              }
              rightSubtitle={<Text style={{color:'tomato',textAlign:'right'}}>
                {item.price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
              </Text>}
              subtitle={<View>
                <Text style={{color:'#9e9e9e'}}>Số lượng: {item.quantity}</Text>
                <Text style={{color:'#9e9e9e'}}>{item.gtin_code}</Text>
                {item.exp && <Text style={{color:'#9e9e9e'}}>EXP: {
                  (item.exp.length>10)?parseDate(item.exp.slice(0,10)):item.exp
                }</Text>}
              </View>}
              leftAvatar={{ source: { uri: config.getImage(item.img_url) } }} bottomDivider
            />
          )}
          ListFooterComponent={
          <View style={styles.bgwhite}>
            <View>
              <ListItem
                title={'TỔNG CỘNG :'}
                rightElement={<View style={styles.roundCornerPad}/>}
                rightSubtitle={
                <Text style={{color:'tomato',textAlign:'right'}}>
                  {total_amount.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                </Text>
                }
                bottomDivider
              />
            </View>
            <View style={[styles.center,styles.mx2p,styles.mt4]}>
              <TouchableOpacity style={[styles.roundBtn,styles.bgsuccess,styles.w100p]}
                onPress={this.handleSold} >
                <Text style={styles.white}>BÁN</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.roundBtn,styles.bgwarning,styles.w100p]}
                onPress={()=>this.setState({sell_list:[]})} >
                <Text style={styles.white}>XÓA TẤT CẢ</Text>
              </TouchableOpacity>
            </View>
          </View>
          }
        />

        </View>
        }

        {list.length>0 &&
        <View style={styles.fstRoundBtn}>
          <TouchableOpacity onPress={()=>this.setState({list:[]})} style={styles.roundBlueBtn}>
            <Icon name='close' size={40} color='#fff' />
          </TouchableOpacity>
        </View>
        }
      </SearchBarATC>

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
    </View>
    );
  }
}

export default CalculateTab;