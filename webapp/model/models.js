sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], function (JSONModel, Device) {
    "use strict";

    return {

        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },
        //data: function(){
          //  var dataModel = new JSONModel(device);
            
            //dataModel = {
            //valOpName: "test",
            //valOpNameDB: "",
            //valJurCtrlChk21: "",
            
            //}
            //return dataModel;
            
        //}

    };
});