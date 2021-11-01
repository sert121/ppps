import React from 'react';
import { useNavigation } from '@react-navigation/native';
import  Home  from "./Home";
function Relay() {
    const navigation = useNavigation();
    return (<Home navigation={navigation} />);
}

export default Relay;