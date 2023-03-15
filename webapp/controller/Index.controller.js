sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, MessageToast) {
        "use strict";

        return Controller.extend("Nmsp.sanjoaquin.controller.Index", {
            onInit: async function () {
                this.attachAfterShow(this.onAfterShow);

                var oView = this.getView("Index");              //Instance of view
                var oModel = new sap.ui.model.json.JSONModel(); //This model  will contain the data
                var dataModel = this.getOwnerComponent().getModel("data");//Will contain data mapped from the ODATA services

                //var label = oView.byId("lbl_JurisCtrl");
                //label.setVisible(false);

                //Date Format 20220422
                var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern: "yyyyMMdd"
                });
                //Date Format 04/22/22
                var oDateFormat1 = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern: "M/d/yy"
                });

                var McDate = oDateFormat.format(new Date());
                var today = oDateFormat1.format(new Date());
                var todayOn = new Date();
                todayOn.setDate(todayOn.getDate() - 1);
                todayOn = oDateFormat1.format(todayOn);


                sap.ui.core.BusyIndicator.show();


                //#region Odata Services Consumption
                //#region User
                var serviceCatUrl = "/sap/opu/odata/sap/ZODATA_MC_CATALOGUES_C_SRV/";
                //Instance of ODATA service ZODATA_MC_CATALOGUES_C_SRV
                var OdataServiceCat = new sap.ui.model.odata.ODataModel(serviceCatUrl, true);
                var UsrData = "";
                if (!(typeof OdataServiceCat === "undefined") || !(typeof OdataServiceCat === "null")) {
                    //var usrOdata = this.getUserSrv(UsrModel);
                    //var usrSrv = await this.UsrRead(UsrModel, UsrData);
                    var usrSrv = await this.getUserSrv(OdataServiceCat, UsrData);
                    if (usrSrv[0].result === "ERROR") {
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.error((usrSrv[0].data));
                    }
                    else {

                        //#region WcdByDivision
                        //var servicetbl1Url = "/sap/opu/odata/sap/ZODATA_MC_CATALOGUES_C_SRV/";
                        //var Tbl1Model = new sap.ui.model.odata.ODataModel(serviceCatUrl, true);
                        var TblWcdData = "";
                        var WcdSrv = await this.getWcdSrv(OdataServiceCat, TblWcdData);
                        if (WcdSrv[0].result === "ERROR") {
                            sap.ui.core.BusyIndicator.hide();
                            MessageBox.error((WcdSrv[0].data));
                        }
                        else {
                            //#region UnitStatDivision
                            //var servicetbl2Url = "/sap/opu/odata/sap/ZODATA_MC_CATALOGUES_C_SRV/";
                            //var TblPusRepModel = new sap.ui.model.odata.ODataModel(servicetbl2Url, true);
                            var TblPusRepData = "";
                            var PusRepSrv = await this.getPusRepSrv(OdataServiceCat, TblPusRepData);
                            if (PusRepSrv[0].result === "ERROR") {
                                sap.ui.core.BusyIndicator.hide();
                                MessageBox.error((PusRepSrv[0].data));

                            }
                            else {
                                var srvRmrksUrl = "/sap/opu/odata/sap/ZODATA_MC_WRDTREM_SJ_01_SRV/";
                                var OdataSrvRmrks = new sap.ui.model.odata.ODataModel(srvRmrksUrl, true);
                                var RmrksData = "";
                                var rmrksSrv = await this.getRmrksSrv(OdataSrvRmrks, RmrksData);
                                if (rmrksSrv[0].result === "ERROR") {
                                    sap.ui.core.BusyIndicator.hide();
                                    MessageBox.error((rmrksSrv[0].data));
                                }
                                else {
                                    var srvMidNgthConUrl = "/sap/opu/odata/sap/ZODATA_MC_WRSJ_SRV/";
                                    var OdataSrvData = new sap.ui.model.odata.ODataModel(srvMidNgthConUrl, true);
                                    var MidNgthCon = "";
                                    var MidNgthConSrv = await this.getMidNgthConSrv(OdataSrvData, RmrksData);
                                    if (MidNgthConSrv[0].result === "ERROR") {
                                        sap.ui.core.BusyIndicator.hide();
                                        MessageBox.error((MidNgthConSrv[0].data));
                                    }
                                    else {

                                        if (MidNgthConSrv[0].data.results[0].Mcdate === oDateFormat.format(new Date())) {
                                        //if ("DUMMY" === oDateFormat.format(new Date())) {
                                            var btnSb = oView.byId("btn_Submit");
                                            btnSb.setEnabled(false);
                                            MessageBox.warning("This form has been successfully submitted.\n\r" +
                                                "No other midnight condition report for this date may be created or submitted");
                                            dataModel.setProperty("/valSubmitted", "This form has been submitted")

                                        }
                                        //Function to mapp all data from ODATA Services to view objects
                                        dataModel = this.SetData(usrSrv, WcdSrv, PusRepSrv, rmrksSrv, MidNgthConSrv, today, dataModel, McDate)

                                        oModel.setData(null);
                                        oModel = dataModel;
                                        oView.setModel(oModel);

                                        sap.ui.core.BusyIndicator.hide();

                                        //Add functionality onfocusout to validate format for input fields with decimals
                                        var object; //Input object to validate
                                        object = oView.byId("iptLpppFbyElv");
                                        var decAll = 0;             //Number of decimals allowed for input object
                                        decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                        this.addEvent(object, "iptLpppFbyElv", "valLpppFbayElv", decAll);//Function to add onfocusout event to Input object

                                        //Add functionality onfocusout to validate format for input fields with decimals

                                        object = oView.byId("iptBhppFbyElv");
                                        var decAll = 0;             //Number of decimals allowed for input object
                                        decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                        this.addEvent(object, "iptBhppFbyElv", "valBhppFbayEl", decAll);//Function to add onfocusout event to Input object

                                        //Add functionality onfocusout to validate format for input fields with decimals

                                        object = oView.byId("iptDeppFbyElv");
                                        var decAll = 0;             //Number of decimals allowed for input object
                                        decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                        this.addEvent(object, "iptDeppFbyElv", "valDeppFbayEl", decAll);//Function to add onfocusout event to Input object

                                        //Add functionality onfocusout to validate format for input fields with decimals

                                        object = oView.byId("iptBlppFbyElv");
                                        var decAll = 0;             //Number of decimals allowed for input object
                                        decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                        this.addEvent(object, "iptBlppFbyElv", "valBlppFbayEl", decAll);//Function to add onfocusout event to Input object

                                        //Add functionality onfocusout to validate format for input fields with decimals
                                        var object; //Input object to validate
                                        object = oView.byId("iptPoppFbyElv");
                                        var decAll = 0;             //Number of decimals allowed for input object
                                        decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                        this.addEvent(object, "iptPoppFbyElv", "valPoppFbayElv", decAll);//Function to add onfocusout event to Input object

                                        //Add functionality onfocusout to validate format for input fields with decimals

                                        object = oView.byId("iptTnk1");
                                        var decAll = 0;             //Number of decimals allowed for input object
                                        decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                        this.addEvent(object, "iptTnk1", "valTnkSite1", decAll);//Function to add onfocusout event to Input object

                                        //Add functionality onfocusout to validate format for input fields with decimals

                                        object = oView.byId("iptTnk2");
                                        var decAll = 0;             //Number of decimals allowed for input object
                                        decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                        this.addEvent(object, "iptTnk2", "valTnkSite2", decAll);//Function to add onfocusout event to Input object

                                        //Add functionality onfocusout to validate format for input fields with decimals
                                        var object; //Input object to validate
                                        object = oView.byId("iptTnk3");
                                        var decAll = 0;             //Number of decimals allowed for input object
                                        decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                        this.addEvent(object, "iptTnk3", "valTnkSite3", decAll);//Function to add onfocusout event to Input object

                                        //Add functionality onfocusout to validate format for input fields with decimals
                                        var object; //Input object to validate
                                        object = oView.byId("iptBvppFbyElv");
                                        var decAll = 0;             //Number of decimals allowed for input object
                                        decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                        this.addEvent(object, "iptBvppFbyElv", "valBvppFbayElv", decAll);//Function to add onfocusout event to Input object

                                        //Add functionality onfocusout to validate format for input fields with decimals

                                        object = oView.byId("iptWrppFbyElv");
                                        var decAll = 0;             //Number of decimals allowed for input object
                                        decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                        this.addEvent(object, "iptWrppFbyElv", "valWrppFbayElv", decAll);//Function to add onfocusout event to Input object

                                        //Add functionality onfocusout to validate format for input fields with decimals

                                        object = oView.byId("iptWgppFbyElv");
                                        var decAll = 0;             //Number of decimals allowed for input object
                                        decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                        this.addEvent(object, "iptWgppFbyElv", "valWgppFbayElv", decAll);//Function to add onfocusout event to Input object

                                        //Add functionality onfocusout to validate format for input fields with decimals

                                        object = oView.byId("iptEdppFbyElv");
                                        var decAll = 0;             //Number of decimals allowed for input object
                                        decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                        this.addEvent(object, "iptEdppFbyElv", "valEdppFbayElv", decAll);//Function to add onfocusout event to Input object

                                    }
                                }
                            }
                        }
                        //usrSrv[0].data.results[0].NameTextc;
                    }


                }
                else {
                    MessageBox.error("Error with service: /sap/opu/odata/sap/ZODATA_MC_CATALOGUES_C_SRV/");
                }

                //#region Odata Services Consumption
            },

            getUserSrv: async function (UsrModel, data) {
                //Esto sirve para saber si una variables ya esta definida
                var resolve = "";
                var reject = "";
                const oPromise = await new Promise(function (resolve, reject) {
                    UsrModel.read("/USER_ADDRSet", {
                        //urlParameters: {
                        //  "$top" : 1
                        //},
                        success: (oData) => {
                            //alert(oData.results[0].Accm);
                            //alert(oResponse);
                            resolve({ result: "SUCCESS", data: oData });
                            var UsrData = oData;
                            var UsrResp = oResponse;

                            //#endregion
                        },

                        error: (oData) => {
                            var usrError = ("Conection Error\n\r" + "URL: " + oData.response.requestUri.valueOf(Text) + "\n\rStatus: " + oData.response.statusCode.valueOf(Text) + "\n\rBody:" + oData.response.body.valueOf(Text));
                            resolve({ result: "ERROR", data: usrError });
                            reject(oData);
                            //MessageBox.error(usrError);

                        },

                    });

                });
                //data = oPromise.results;
                return [oPromise];

            },
            getWcdSrv: async function (UsrModel, data) {
                //Esto sirve para saber si una variables ya esta definida
                var resolve = "";
                var reject = "";
                const oPromise = await new Promise(function (resolve, reject) {
                    UsrModel.read("/WcdByDivision", {
                        urlParameters: {
                            "Div": "'WRSJ'"
                            //"$top" : 1
                        },
                        success: (oData) => {
                            //alert(oData.results[0].Accm);
                            //alert(oResponse);
                            resolve({ result: "SUCCESS", data: oData });
                            var UsrData = oData;
                            var UsrResp = oResponse;

                            //#endregion
                        },

                        error: (oData) => {
                            var usrError = ("Conection Error\n\r" + "URL: " + oData.response.requestUri.valueOf(Text) + "\n\rStatus: " + oData.response.statusCode.valueOf(Text) + "\n\rBody:" + oData.response.body.valueOf(Text));
                            resolve({ result: "ERROR", data: usrError });
                            reject(oData);
                            //MessageBox.error(usrError);

                        },


                    });

                });
                //data = oPromise.results;
                return [oPromise];

            },
            getPusRepSrv: async function (UsrModel, data) {
                //Esto sirve para saber si una variables ya esta definida
                var resolve = "";
                var reject = "";
                const oPromise = await new Promise(function (resolve, reject) {
                    UsrModel.read("/UnitStatDivision", {
                        urlParameters: {
                            "Divis": "'WRSJ'"
                            //"$top" : 1
                        },
                        success: (oData) => {
                            //alert(oData.results[0].Accm);
                            //alert(oResponse);
                            resolve({ result: "SUCCESS", data: oData });
                            var UsrData = oData;
                            var UsrResp = oResponse;

                            //#endregion
                        },

                        error: (oData) => {
                            var usrError = ("Conection Error\n\r" + "URL: " + oData.response.requestUri.valueOf(Text) + "\n\rStatus: " + oData.response.statusCode.valueOf(Text) + "\n\rBody:" + oData.response.body.valueOf(Text));
                            resolve({ result: "ERROR", data: usrError });
                            reject(oData);
                            //MessageBox.error(usrError);

                        },


                    });

                });
                //data = oPromise.results;
                return [oPromise];

            },
            getRmrksSrv: async function (UsrModel, data) {
                //Esto sirve para saber si una variables ya esta definida
                var resolve = "";
                var reject = "";
                const oPromise = await new Promise(function (resolve, reject) {
                    UsrModel.read("/ZWCM_MC_WRSJ_REMARKSSet", {
                        // urlParameters: {
                        //"Divis": "'WRSJ'"
                        //"$top" : 1
                        //},
                        success: (oData) => {
                            //alert(oData.results[0].Accm);
                            //alert(oResponse);
                            resolve({ result: "SUCCESS", data: oData });
                            var UsrData = oData;
                            var UsrResp = oResponse;

                            //#endregion
                        },

                        error: (oData) => {
                            var usrError = ("Conection Error\n\r" + "URL: " + oData.response.requestUri.valueOf(Text) + "\n\rStatus: " + oData.response.statusCode.valueOf(Text) + "\n\rBody:" + oData.response.body.valueOf(Text));
                            resolve({ result: "ERROR", data: usrError });
                            reject(oData);
                            //MessageBox.error(usrError);

                        },


                    });

                });
                //data = oPromise.results;
                return [oPromise];

            },
            postRmrksSrv: async function (UsrModel, data) {
                //Esto sirve para saber si una variables ya esta definida
                var resolve = "";
                var reject = "";
                const oPromise = await new Promise(function (resolve, reject) {
                    UsrModel.create("/ZWCM_MC_WRSJ_REMARKSSet", data, {
                        // urlParameters: {
                        //"Divis": "'WRSJ'"
                        //"$top" : 1
                        //},
                        method: "POST",
                        success: (oData) => {
                            //alert(oData.results[0].Accm);
                            //alert(oResponse);
                            resolve({ result: "SUCCESS", data: oData });
                            var UsrData = oData;
                            var UsrResp = oResponse;

                            //#endregion
                        },

                        error: (oData) => {
                            var usrError = ("Conection Error\n\r" + "URL: " + oData.response.requestUri.valueOf(Text) + "\n\rStatus: " + oData.response.statusCode.valueOf(Text) + "\n\rBody:" + oData.response.body.valueOf(Text));
                            resolve({ result: "ERROR", data: usrError });
                            reject(oData);
                            //MessageBox.error(usrError);

                        },


                    });

                });
                //data = oPromise.results;
                return [oPromise];

            },
            getMidNgthConSrv: async function (UsrModel, data) {
                //Esto sirve para saber si una variables ya esta definida
                var resolve = "";
                var reject = "";
                const oPromise = await new Promise(function (resolve, reject) {
                    UsrModel.read("/ZSWCM_MC_WRSJSet", {
                        // urlParameters: {
                        //"Divis": "'WRSJ'"
                        //"$top" : 1
                        //},
                        success: (oData) => {
                            //alert(oData.results[0].Accm);
                            //alert(oResponse);
                            resolve({ result: "SUCCESS", data: oData });
                            var UsrData = oData;
                            var UsrResp = oResponse;

                            //#endregion
                        },

                        error: (oData) => {
                            var usrError = ("Conection Error\n\r" + "URL: " + oData.response.requestUri.valueOf(Text) + "\n\rStatus: " + oData.response.statusCode.valueOf(Text) + "\n\rBody:" + oData.response.body.valueOf(Text));
                            resolve({ result: "ERROR", data: usrError });
                            reject(oData);
                            //MessageBox.error(usrError);

                        },


                    });

                });
                //data = oPromise.results;
                return [oPromise];

            },
            postMidNgthConSrv: async function (UsrModel, data) {
                //Esto sirve para saber si una variables ya esta definida
                var resolve = "";
                var reject = "";
                const oPromise = await new Promise(function (resolve, reject) {
                    UsrModel.create("/ZSWCM_MC_WRSJSet", data, {
                        // urlParameters: 
                        //"Divis": "'WRSJ'"
                        //"$top" : 1
                        //},
                        method: "POST",
                        success: (oData, oResponse) => {
                            //alert(oData.results[0].Accm);
                            //alert(oResponse);
                            resolve({ result: "SUCCESS", data: oResponse });
                            var UsrData = oData;
                            var UsrResp = oResponse;

                            //#endregion
                        },

                        error: (oData) => {
                            var usrError = ("Conection Error\n\r" + "URL: " + oData.response.requestUri.valueOf(Text) + "\n\rStatus: " + oData.response.statusCode.valueOf(Text) + "\n\rBody:" + oData.response.body.valueOf(Text));
                            resolve({ result: "ERROR", data: usrError });
                            reject(oData);
                            //MessageBox.error(usrError);

                        },


                    });

                });
                //data = oPromise.results;
                return [oPromise];

            },
            dif_cal: function (json_datos, flag, prevday, prevDaySchAllaf, dif_val, values, netValInt, netValDec, oNumberFormat, dif) {
                values = this.number_val(json_datos.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec]
                if (values[0] == "X") {
                    prevday = values[1] + "." + values[2];
                }
                else {
                    prevday = values[1];
                }
                values = this.number_val(json_datos.val_CliftCourt_af, flag, netValInt, netValDec)
                if (values[0] == "X") {
                    prevDaySchAllaf = values[1] + "." + values[2];
                }
                else {
                    prevDaySchAllaf = values[1];
                }
                dif_val = oNumberFormat.format(this.Clifton_dif(Number(prevday), Number(prevDaySchAllaf), dif));
                json_datos.val_CliftCourt_Dif = dif_val;
            },

            Clifton_dif: function (prevday, prevsch, dif) {
                dif = prevday - prevsch;
                return dif;
            },
            number_val: function (val, flag, int, dec) {
                //Verificamos si el valor contiene . decimal
                if (val.includes(".")) {
                    //Si se encontró el . decimal entonces separamos enteros de decimales en un array
                    var IntDec = val.split('.');

                    //Nos aseguramos de que solo existan dígitos tanto en los enteros como en los decimales
                    int = IntDec[0].replace(/[^\d]/g, "");//Regex muy simple si encuentra "," en cualquier parte del valor, lo reemplaza o en este caso lo elimina.
                    dec = IntDec[1].replace(/[^\d]/g, "");
                    flag = "X";
                }
                //Si no se encuentra . decimale entonces tomamos el valor enviado por el usuario
                else {
                    //Nos aseguramos de que solo existan dígitos
                    int = val.replace(/[^\d]/g, "");//Regex muy simple si encuentra "," en cualquier parte del valor, lo reemplaza o en este caso lo elimina.
                    dec = "";
                    flag = "";
                }
                return [flag, int, dec];

            },
            /**Se dispara con el evento liveChange, Para validar input solo números, limitado a 5 dígitos, separador de miles = "," */
            OnLiveChgEvt: function (evt) {

                //Para obtener los parámetros enviados en el eventhandler(evt), esto nos servirá para
                //Crear el objeto formateador
                var dig = evt.getSource().data("digitsallowed");     //Número de dígitos permitidos
                var id = evt.getSource().data("error");              //Texto identificador del mensaje de error
                var decAllwd = evt.getSource().data("decAllwd");     //Número de decimales permitidos
                var obj_name = evt.getSource().data("name");         //Nombre del objeto que dispara el evento
                var obj_valId = evt.getSource().data("val");         //Nombre de la variable que contiene el valor
                var sign_allwd = evt.getSource().data("sign");       //Indica que el campo acepta signos + o -
                var flag_dec = "";                                   //Flag para saber si contiene decimales
                var sign = "";                                       //Para considerar signos.
                //#region Variables para calculo de diferencia
                var prevDaySchAllaf = 0;
                var prevday = 0;
                var dif = 0;
                var dif_val = 0;
                var netValInt = 0;
                var netValDec = 0;
                var flag = "";
                var values;
                //#endregion
                //------------------------------------

                //Se crea un objeto de tipo formateador, el cual sirve para aplicar el formato requerido al objeto
                var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                    //Número de decimales permitidos, en este caso solo queremos números enteros
                    maxFractionDigits: decAllwd,
                    //Se agrupan los números, en este caso de 3 en 3
                    groupingEnabled: true,
                    //Separados de grupos
                    groupingSeparator: ",",
                    //Separador para decimales
                    decimalSeparator: ".",
                    //Número máximo de dígitos permitidos
                    maxIntegerDigits: dig
                });

                //-------------------------------------------

                //Se crea el modelo json que nos servirá para recuperar y mandar valores a los objetos de la vista
                //Se obtiene la vista, lo cual nos da acceso a todos los componentes en ella.
                var vistaOnChange = this.getView("Index");
                //var oJSONModel = new sap.ui.model.json.JSONModel();
                var Modelo_vista = vistaOnChange.getModel();
                var json_datos = Modelo_vista.getData();

                //Se obtiene la fuente (objeto) que disparó el evento y a continuación el valor de dicho objeto
                var value = evt.getSource().getValue();
                Modelo_vista.setData(null);

                //if (typeof IntDec === "undefined") {
                //Esto sirve para saber si una variables ya esta definida
                //}

                //----------------------------
                if ((value.substring(0, 1).includes("+") || value.substring(0, 1).includes("-")) && sign_allwd === "X") {
                    switch (value.substring(0, 1)) {
                        //case "+":
                        //  sign = "+";
                        //break;
                        case "-":
                            sign = "-";
                            break;
                        default:
                            break;
                    }

                }
                //Verificamos si el valor contiene . decimal
                if (value.includes(".")) {
                    //Si se encontró el . decimal entonces separamos enteros de decimales en un array
                    var IntDec = value.split('.');

                    //Nos aseguramos de que solo existan dígitos tanto en los enteros como en los decimales
                    var netvalueint = IntDec[0].replace(/[^\d]/g, "");//Regex muy simple si encuentra "," en cualquier parte del valor, lo reemplaza o en este caso lo elimina.
                    // if(decAllwd !=""){
                    var netvaluedec = IntDec[1].replace(/[^\d]/g, "");
                    flag_dec = "X";
                    //}
                    //else{

                }
                //Si no se encuentra . decimale entonces tomamos el valor enviado por el usuario
                else {
                    //Nos aseguramos de que solo existan dígitos
                    var value = value.replace(/[^\d]/g, "");//Regex muy simple si encuentra "," en cualquier parte del valor, lo reemplaza o en este caso lo elimina.
                    flag_dec = "";
                }
                if ((flag_dec === "X" && decAllwd != "") || flag_dec === "") {

                    //---------------------------------

                    //Verificamos que los enteros no excedan el valor indicado de digitos permitidos ()
                    //Se verifica si la variante netvaluint esta definida(se encontró . decimal y se realizó el split)
                    if (typeof netvalueint !== "undefined") {
                        // Si esta definida hay punto decimal y por l tanto usamos el valor recuperado de la vista
                        if (netvalueint.length > dig) {
                            //Si se sobrepaso el número de dígitos permitidos se lanza msg de error.
                            if (decAllwd > 0) {
                                if (decAllwd === "1") {
                                    var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                        " digit number with " + decAllwd + " decimal place." + "\n\r Please enter a proper value.";
                                    json_datos[obj_valId] = "";

                                    format_value = "";
                                }
                                else {
                                    var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                        " digit number with " + decAllwd + " decimal places." + "\n\r Please enter a proper value.";
                                    json_datos[obj_valId] = "";

                                    format_value = "";
                                }

                            }
                            else {
                                var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                    " digit number." + "\n\r Please enter a proper value.";
                                json_datos[obj_valId] = "";
                                format_value = "";
                            }
                            sap.m.MessageBox.error(msgerror);
                        }
                        else {
                            //Verificamos que la variable contenga valores, en este punto deberian ser dígitos o null o podría ser "" por q se ingresó
                            //un . decimal como primer caracter
                            if (netvalueint !== null & netvalueint !== "") {

                                //Verificamos si existen valores en la parte decimal
                                if ((netvaluedec !== null && netvaluedec !== "" && netvaluedec !== undefined)) {
                                    //Si hay decimales se concatenan a los enteros y se formatea
                                    value = netvalueint + '.' + netvaluedec;
                                    var format_value = sign + oNumberFormat.format(value);
                                }
                                else {
                                    //Si no hay decimales se formatean solo los enteros

                                    var format_value = oNumberFormat.format(netvalueint);
                                    //Se agrega el punto decimal 
                                    if (decAllwd != "") {
                                        format_value = sign + format_value + ".";
                                    }
                                    else {
                                        format_value = sign + format_value;
                                    }

                                }
                            }
                            else {
                                //No se encontraron valores enteros
                                //Se verifica si hay valores decimales
                                if (netvaluedec !== null & netvaluedec !== "") {
                                    value = '.' + netvaluedec;
                                    //var format_value = sign + oNumberFormat.format(value);
                                    var format_value = sign + value;
                                }
                                else {
                                    // no hay decimales, se devuelve el punto decimal.
                                    var format_value = sign + '.';
                                }
                            }
                        }
                    }
                    //Si no se realizó el split se usa el valor recuperado de la vista (value)
                    else {
                        if (value.length > dig) {
                            //Si se sobrepaso el número de dígitos permitidos se lanza msg de error.
                            if (decAllwd > 0) {
                                if (decAllwd === "1") {
                                    var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                        " digit number with " + decAllwd + " decimal place." + "\n\r Please enter a proper value.";
                                    json_datos[obj_valId] = "";

                                    format_value = "";
                                }
                                else {
                                    var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                        " digit number with " + decAllwd + " decimal places." + "\n\r Please enter a proper value.";
                                    json_datos[obj_valId] = "";

                                    format_value = "";
                                }

                            }
                            else {
                                var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                    " digit number. " + "\n\r Please enter a proper value.";
                                json_datos[obj_valId] = "";
                                format_value = "";
                            }
                            sap.m.MessageBox.error(msgerror);
                        }
                        else {
                            if (value !== "") {
                                var format_value = sign + oNumberFormat.format(value);
                                //var format_value = sign + this.format(value).toString();



                                //var format_value = sign + this.format(value);


                                //var format_value = sign + value;
                            }
                            else {
                                var format_value = sign + "";
                            }

                        }
                    }
                }
                else {
                    var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                        " digit number." + "\n\r Please enter a proper value.";
                    json_datos[obj_valId] = "";
                    format_value = ""; //oNumberFormat.format(netvalueint);
                    sap.m.MessageBox.error(msgerror);
                }

                json_datos[obj_valId] = format_value;

                if (obj_name === "ipt_CliftCourt2_PrevDay_DA" || obj_name === "ipt_CliftCourt_PrevDay_SAAf") {


                    values = this.number_val(json_datos.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec]
                    this.dif_cal(json_datos, flag, prevday, prevDaySchAllaf, dif_val, values, netValInt, netValDec, oNumberFormat, dif)
                }
                //Cuando se modifique el valor del campo Prev. Day Scheduled Allotment, se calcula el valor del campo
                //Prev. Day Scheduled AllotmentAF
                if (obj_name === "ipt_CliftCourt4_PrevDay_SA") {
                    //Se crea un objeto de tipo formateador, el cual sirve para aplicar el formato requerido al objeto
                    var oNumberFormat1 = sap.ui.core.format.NumberFormat.getFloatInstance({
                        //Número de decimales permitidos, en este caso solo queremos números enteros
                        maxFractionDigits: 0,
                        //Se agrupan los números, en este caso de 3 en 3
                        groupingEnabled: true,
                        //Separados de grupos
                        groupingSeparator: ",",
                        //Separador para decimales
                        decimalSeparator: "",
                        //Número máximo de dígitos permitidos
                        maxIntegerDigits: 6,
                        //roundingMode: "TOWARDS_ZERO"
                    });
                    var valClifCrtAf = json_datos[obj_valId].replace(/,/g, "");

                    var calc = (Number(valClifCrtAf) * 1.9835).toString();
                    var PdIntDec = "";
                    if (calc.includes(".")) {
                        PdIntDec = calc.split('.');
                        json_datos.val_CliftCourt_af = oNumberFormat1.format(PdIntDec[0]);
                    }
                    else {
                        json_datos.val_CliftCourt_af = oNumberFormat1.format(calc);
                    }

                    values = this.number_val(json_datos.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec]
                    this.dif_cal(json_datos, flag, prevday, prevDaySchAllaf, dif_val, values, netValInt, netValDec, oNumberFormat, dif)

                }
                if (obj_name === "ipt_DvppArrMtr" || obj_name === "ipt_DvppRelInAq") {
                    var oNumberFormatDvpp = sap.ui.core.format.NumberFormat.getFloatInstance({
                        //Número máximo de dígitos permitidos
                        maxIntegerDigits: 9,
                        //Número de decimales permitidos, en este caso solo queremos números enteros
                        maxFractionDigits: 0,
                        //Se agrupan los números, en este caso de 3 en 3
                        groupingEnabled: true,
                        //Separados de grupos
                        groupingSeparator: ",",
                        //Separador para decimales
                        decimalSeparator: "",

                    });
                    var ArrMtr = Number(json_datos.val_dvpp_arrMtr);
                    var Devria = Number(json_datos.val_dvpp_relIntoAqu);

                    if (ArrMtr > 0) {
                        var total = ArrMtr + Devria;
                        json_datos.val_sbpp_aquedBlend = oNumberFormatDvpp.format((ArrMtr * 100) / (ArrMtr + Devria).toString());
                    }
                    var aqBlend = 100 - Number(json_datos.val_sbpp_aquedBlend);
                    json_datos.val_sbpp_dvRes = oNumberFormatDvpp.format(aqBlend.toString());

                }




                // }


                //oJSON.obj_valId = format_value;
                //oJSONModel.setProperty(obj_valId, format_value);
                Modelo_vista.setData(json_datos);//se envía el objeto json al modelo json creado previamente
                Modelo_vista.updateBindings(true);
                vistaOnChange.setModel(Modelo_vista);//Se modifican los datos de la vista por medio del modelo json.
                //jQuery.sap.delayedCall(500, this, function () { this.byId("iptLpppFbyElv").focus(); });
                //jQuery.sap.delayedCall(500, this, function () { this.byId(obj_name).focus(); });

            },
            format: function (val) {
                var pos;
                var ciclo = 0;
                var desde = 0;
                var hasta = 0;
                var len = val.length;
                var len2 = len;
                var value;
                var grupo = 0;
                var int;
                var dec;
                if (len > 3) {
                    while (0 < len) {
                        grupo = grupo + 1;
                        if (grupo == 3) {
                            ciclo = ciclo + 1;
                            if (len >= 1) {
                                desde = len2 - 3;
                                hasta = val.length;
                                value = "," + val.substring(desde, hasta);
                                val = val.substring(0, (len2 - 3));
                                grupo = 0;
                            }


                        }
                        len = len - 1;
                    }
                    if (grupo !== 0) {
                        value = val + value;
                    }

                }
                else {
                    value = val;
                }

                return value.toString();

            },

            addEvent: function (ObName, ObId, Oval, dec) {
                var oJSONModel = new sap.ui.model.json.JSONModel();
                var oView = this.getView("Index");
                var oModel = oView.getModel();
                var oData = oModel.getData();
                oModel.setData(null);

                ObName.addEventDelegate({
                    onfocusout: $.proxy(function (oEvent) {
                        if (dec !== "0") {
                            var idx = 0;
                            var val;
                            var obj = this.byId(ObId);
                            var value = obj.getValue();
                            var last_ch = value.substring((value.length - 1));
                            if (last_ch === '.') {
                                //obj.setValue(value.substring((value.length - 1), 0));
                                while (idx < dec) {
                                    oData[Oval] = value + "0";
                                    value = oData[Oval];
                                    idx++;
                                }
                                //var error = "The maximum allowed limit for 'Alameda Country' is a 4 digit number with a single decimal place. \n\r Please enter a proper value. ";
                                //sap.m.MessageBox.error(error);
                            }
                            else {
                                if (value.includes(".")) {
                                    var values = value.split(".")
                                    val = (values[1].length);
                                    idx = val;
                                }

                                while (idx < dec) {
                                    if (idx === 0) {
                                        oData[Oval] = value + ".0";
                                    }
                                    else {
                                        oData[Oval] = value + "0";
                                    }

                                    value = oData[Oval];
                                    idx++;
                                }
                            }

                        }
                        //Delete leading Zero
                    //    if (value.length > 1) {

                      ////      var firstchr = value.toString().substring(0, 1);
                          //  if (firstchr === "0" && value.toString().substring(1, 2) !== ".") {
                            //    oData[Oval] = value.toString().substring(1, (value.length));
                            //}


                            //if (firstchr === ".") {
                              //  oData[Oval] = "0" + oData[Oval];
                            //}


                    //    }
                        //End delete leading Zero

                        oModel.setData(oData);
                        oView.setModel(oModel);

                    }, this)
                });
                oModel.setData(oData);
                oView.setModel(oModel);
            },
            getDecAll: function (Object) {
                var param = Object.getCustomData();
                var decAll = 0;
                for (let index = 0; index < param.length; index++) {
                    const element = param[index];
                    if (element.getProperty("key") === "decAllwd") {
                        decAll = Number(element.getProperty("value"));
                        break;
                    }
                }
                return decAll;
            },
            OnCbxChng: function (evt) {
                var view = this.getView("Index");
                var model = view.getModel();
                var secIcon = view.byId(evt.getSource().data("icon"));
                var cbxId = evt.getSource().data("cbxName");
                var dataSrc = evt.getSource().data("dataSource");
                var selKey = evt.getSource().data("selkey");
                var cbx = view.byId([cbxId]);
                var cbxJson = view.getModel().getData();
                var list = cbxJson[dataSrc];
                var flag = "";

                for (let index = 0; index < list.length; index++) {
                    if (list[index].text === cbx.getValue()) {
                        flag = "X";
                        break;
                    }

                }
                if (flag === "") {

                    sap.m.MessageBox.error("Select a valid value.");
                    cbxJson[selKey] = list[0].key.toString();
                    model.setData("");
                    model.setData(cbxJson);
                    view.setModel(model);
                }


                if (cbxId === "cbx_SecThreatLvls_nat" || cbxId === "cbx_SecThreatLvls_dwr") {
                    //Se obtiene la vista, lo cual nos da acceso a todos los componentes en ella.
                    //var oView = this.getView("View1");
                    //var model = oView.getModel();
                    //var json = model.getData();
                    //var cbx = oView.byId(evt.getSource().data("obj_name"));
                    var val = cbx._getSelectedItemText();

                    //lbl.removeStyleClass("cbx_green");
                    //lbl.removeStyleClass("cbx_orange");
                    //lbl.removeStyleClass("cbx_red");

                    switch (val) {
                        case "NORMAL":
                            // lbl.addStyleClass("cbx_green");
                            secIcon.setBackgroundColor("green");
                            secIcon.setColor("green");
                            break;
                        case "ELEVATED":
                            // lbl.addStyleClass("cbx_orange");
                            secIcon.setBackgroundColor("orange");
                            secIcon.setColor("orange");
                            break;
                        case "IMMINENT":
                            //lbl.addStyleClass("cbx_red");
                            secIcon.setBackgroundColor("red");
                            secIcon.setColor("red");
                            break;
                        default:
                            if (cbxId === "cbx_SecThreatLvls_nat")
                                model.setProperty("/valSecThrLvNat", "");
                            else {
                                model.setProperty("/valSecThrLvDwr", "");
                            }
                            secIcon.setBackgroundColor("");
                            secIcon.setColor("");

                            break;
                    }
                }
                //if (cbx.value() && cbx.selectedIndex == -1) {
                //var dt = this.dataSource._data[0];
                //  cbx.text("");


            },
            InitialFormat: function (digAll, err, decall, name, val, psign, pValue) {

                //Para obtener los parámetros enviados en el eventhandler(evt), esto nos servirá para
                //Crear el objeto formateador
                var dig = digAll;     //Número de dígitos permitidos
                var id = err;              //Texto identificador del mensaje de error
                var decAllwd = decall;     //Número de decimales permitidos
                var obj_name = name;         //Nombre del objeto que dispara el evento
                var obj_valId = val;         //Nombre de la variable que contiene el valor
                var sign_allwd = psign;       //Indica que el campo acepta signos + o -
                var flag_dec = "";                                   //Flag para saber si contiene decimales
                var sign = "";                                       //Para considerar signos.
                //#region Variables para calculo de diferencia
                var prevDaySchAllaf = 0;
                var prevday = 0;
                var dif = 0;
                var dif_val = 0;
                var netValInt = 0;
                var netValDec = 0;
                var flag = "";
                var values;
                //#endregion
                //------------------------------------

                //Se crea un objeto de tipo formateador, el cual sirve para aplicar el formato requerido al objeto
                var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                    //Número de decimales permitidos, en este caso solo queremos números enteros
                    maxFractionDigits: decAllwd,
                    //Se agrupan los números, en este caso de 3 en 3
                    groupingEnabled: true,
                    //Separados de grupos
                    groupingSeparator: ",",
                    //Separador para decimales
                    decimalSeparator: ".",
                    //Número máximo de dígitos permitidos
                    maxIntegerDigits: dig
                });

                //-------------------------------------------

                //Se crea el modelo json que nos servirá para recuperar y mandar valores a los objetos de la vista
                //Se obtiene la vista, lo cual nos da acceso a todos los componentes en ella.
                var vistaOnChange = this.getView("Index");
                //var oJSONModel = new sap.ui.model.json.JSONModel();
                var Modelo_vista = vistaOnChange.getModel();
                //var json_datos = Modelo_vista.getData();
                var oJSON = {};

                //Se obtiene la fuente (objeto) que disparó el evento y a continuación el valor de dicho objeto
                var value = pValue //vistaOnChange.byId([obj_name]).getValue();
                //Modelo_vista.setData(null);

                //if (typeof IntDec === "undefined") {
                //Esto sirve para saber si una variables ya esta definida
                //}

                //----------------------------
                if ((value.substring(0, 1).includes("+") || value.substring(0, 1).includes("-")) && sign_allwd === "X") {
                    switch (value.substring(0, 1)) {
                        case "+":
                            sign = "+";
                            break;
                        case "-":
                            sign = "-";
                            break;
                        default:
                            break;
                    }

                }
                //Verificamos si el valor contiene . decimal
                if (value.includes(".")) {
                    //Si se encontró el . decimal entonces separamos enteros de decimales en un array
                    var IntDec = value.split('.');

                    //Nos aseguramos de que solo existan dígitos tanto en los enteros como en los decimales
                    var netvalueint = IntDec[0].replace(/[^\d]/g, "");//Regex muy simple si encuentra "," en cualquier parte del valor, lo reemplaza o en este caso lo elimina.
                    var netvaluedec = IntDec[1].replace(/[^\d]/g, "");
                    flag_dec = "X";
                }
                //Si no se encuentra . decimale entonces tomamos el valor enviado por el usuario
                else {
                    //Nos aseguramos de que solo existan dígitos
                    var value = value.replace(/[^\d]/g, "");//Regex muy simple si encuentra "," en cualquier parte del valor, lo reemplaza o en este caso lo elimina.
                    flag_dec = "";
                }


                //---------------------------------

                //Verificamos que los enteros no excedan el valor indicado de digitos permitidos ()
                //Se verifica si la variante netvaluint esta definida(se encontró . decimal y se realizó el split)
                if (typeof netvalueint !== "undefined") {
                    // Si esta definida hay punto decimal y por l tanto usamos el valor recuperado de la vista
                    if (netvalueint.length > dig) {
                        //Si se sobrepaso el número de dígitos permitidos se lanza msg de error.
                        if (decAllwd > 0) {
                            var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                " digit number with " + decAllwd + " decimal places." + "\n\r Please enter a proper value.";
                            oJSON[obj_valId] = "0";

                            format_value = "0";
                            //values = this.number_val(json_datos.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec]
                            //this.dif_cal(json_datos, flag, prevday, prevDaySchAllaf, dif_val,values, netValInt, netValDec,oNumberFormat, dif)


                            //Modelo_vista.setData(json_datos);//se envía el objeto json al modelo json creado previamente
                            //Modelo_vista.updateBindings(true);
                            //vistaOnChange.setModel(Modelo_vista);//Se modifican los datos de la vista por medio del modelo json.
                        }
                        else {
                            var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                " digit number." + "\n\r Please enter a proper value.";
                            oJSON[obj_valId] = "0";
                            format_value = "0";
                            //values = this.number_val(json_datos.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec]
                            //this.dif_cal(json_datos, flag, prevday, prevDaySchAllaf, dif_val,values, netValInt, netValDec,oNumberFormat, dif)

                            //Modelo_vista.setData(json_datos);//se envía el objeto json al modelo json creado previamente
                            //Modelo_vista.updateBindings(true);
                            //vistaOnChange.setModel(Modelo_vista);//Se modifican los datos de la vista por medio del modelo json.
                        }
                        sap.m.MessageBox.error(msgerror);
                    }
                    else {
                        //Verificamos que la variable contenga valores, en este punto deberian ser dígitos o null o podría ser "" por q se ingresó
                        //un . decimal como primer caracter
                        if (netvalueint !== null & netvalueint !== "") {

                            //Verificamos si existen valores en la parte decimal
                            if (netvaluedec !== null & netvaluedec !== "") {
                                //Si hay decimales se concatenan a los enteros y se formatea
                                value = netvalueint + '.' + netvaluedec;
                                var format_value = sign + oNumberFormat.format(value);
                            }
                            else {
                                //Si no hay decimales se formatean solo los enteros

                                var format_value = oNumberFormat.format(netvalueint);
                                //Se agrega el punto decimal 
                                format_value = sign + format_value + '.';
                            }
                        }
                        else {
                            //No se encontraron valores enteros
                            //Se verifica si hay valores decimales
                            if (netvaluedec !== null & netvaluedec !== "") {
                                value = '.' + netvaluedec;
                                var format_value = sign + oNumberFormat.format(value);
                            }
                            else {
                                // no hay decimales, se devuelve el punto decimal.
                                var format_value = sign + '.';
                            }
                        }
                    }
                }
                //Si no se realizó el split se usa el valor recuperado de la vista (value)
                else {
                    if (value.length > dig) {
                        //Si se sobrepaso el número de dígitos permitidos se lanza msg de error.
                        if (decAllwd > 0) {
                            var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                " digit number with " + decAllwd + " decimal places." + "\n\r Please enter a proper value.";
                            oJSON[obj_valId] = "0";
                            format_value = "0";
                            //values = this.number_val(json_datos.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec]
                            //this.dif_cal(json_datos, flag, prevday, prevDaySchAllaf, dif_val,values, netValInt, netValDec,oNumberFormat, dif)


                            //Modelo_vista.setData(json_datos);//se envía el objeto json al modelo json creado previamente
                            //Modelo_vista.updateBindings(true);
                            //vistaOnChange.setModel(Modelo_vista);//Se modifican los datos de la vista por medio del modelo json.
                        }
                        else {
                            var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                " digit number. " + "\n\r Please enter a proper value.";
                            oJSON[obj_valId] = "0";
                            format_value = "0";
                            // values = this.number_val(json_datos.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec]
                            //this.dif_cal(json_datos, flag, prevday, prevDaySchAllaf, dif_val,values, netValInt, netValDec,oNumberFormat, dif)

                            //Modelo_vista.setData(json_datos);//se envía el objeto json al modelo json creado previamente
                            //Modelo_vista.updateBindings(true);
                            //vistaOnChange.setModel(Modelo_vista);//Se modifican los datos de la vista por medio del modelo json.
                        }
                        sap.m.MessageBox.error(msgerror);
                    }
                    else {
                        if (value !== "") {
                            var format_value = sign + oNumberFormat.format(value);
                        }
                        else {
                            var format_value = sign + "";
                        }

                    }
                }

                //Se crea el objeto json que contiene los objetos que necesitamos modificar 

                //oJSONModel.getProperty("/cbx_secThr_Lvl_class");
                //oJSONModel.setProperty("/cbx_secThr_Lvl_class","cbx_green");
                //oModel.setData(modelData);

                // oJSONModel.setData(oJSON);//se envía el objeto json al modelo json creado previamente
                //oView.setModel(oJSONModel);//Se modifican los datos de la vista por medio del modelo json. 

                oJSON[(obj_valId)] = format_value;

                if (obj_name === "ipt_CliftCourt2_PrevDay_DA" || obj_name === "ipt_CliftCourt_PrevDay_SAAf") {


                    //values = this.number_val(oJSON.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec]
                    //this.dif_cal(oJSON, flag, prevday, prevDaySchAllaf, dif_val, values, netValInt, netValDec, oNumberFormat, dif)
                }
                //Cuando se modifique el valor del campo Prev. Day Scheduled Allotment, se calcula el valor del campo
                //Prev. Day Scheduled AllotmentAF
                if (obj_name === "ipt_CliftCourt4_PrevDay_SA") {
                    //Se crea un objeto de tipo formateador, el cual sirve para aplicar el formato requerido al objeto
                    var oNumberFormat1 = sap.ui.core.format.NumberFormat.getFloatInstance({
                        //Número de decimales permitidos, en este caso solo queremos números enteros
                        maxFractionDigits: 0,
                        //Se agrupan los números, en este caso de 3 en 3
                        groupingEnabled: true,
                        //Separados de grupos
                        groupingSeparator: ",",
                        //Separador para decimales
                        decimalSeparator: "",
                        //Número máximo de dígitos permitidos
                        maxIntegerDigits: 6,
                        //roundingMode: "TOWARDS_ZERO"
                    });
                    //var calc = value * 1.9835;
                    //oJSON.val_CliftCourt_af = oNumberFormat1.format(calc);
                    //json_datos.val_CliftCourt_af = Math.round(calc);
                    //json_datos.val_CliftCourt_af = json_datos.val_CliftCourt_af.toString();

                    //values = this.number_val(oJSON.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec]
                    //this.dif_cal(oJSON, flag, prevday, prevDaySchAllaf, dif_val, values, netValInt, netValDec, oNumberFormat, dif)

                }
                if (obj_name === "ipt_DvppArrMtr" || obj_name === "ipt_DvppRelInAq") {
                    var oNumberFormatDvpp = sap.ui.core.format.NumberFormat.getFloatInstance({
                        //Número máximo de dígitos permitidos
                        maxIntegerDigits: 9,
                        //Número de decimales permitidos, en este caso solo queremos números enteros
                        maxFractionDigits: 0,
                        //Se agrupan los números, en este caso de 3 en 3
                        groupingEnabled: true,
                        //Separados de grupos
                        groupingSeparator: ",",
                        //Separador para decimales
                        decimalSeparator: "",

                    });
                    //var ArrMtr = Number(oJSON.val_dvpp_arrMtr);
                    //var Devria = Number(oJSON.val_dvpp_relIntoAqu);

                    //if (ArrMtr > 0) {
                    //  var total = ArrMtr + Devria;
                    // oJSON.val_sbpp_aquedBlend = oNumberFormatDvpp.format((ArrMtr * 100) / (ArrMtr + Devria).toString());
                    // }
                    //var aqBlend = 100 - Number(oJSON.val_sbpp_aquedBlend);
                    //oJSON.val_sbpp_dvRes = oNumberFormatDvpp.format(aqBlend.toString());

                }




                // }


                //oJSON.obj_valId = format_value;
                //oJSONModel.setProperty(obj_valId, format_value);
                //Modelo_vista.setData(json_datos);//se envía el objeto json al modelo json creado previamente
                //Modelo_vista.updateBindings(true);
                //vistaOnChange.setModel(Modelo_vista);//Se modifican los datos de la vista por medio del modelo json.
                return format_value;
            },
            onClear: function (evt) {
                /**var fid = evt.getSource().getId();
                var id = fid.split(/--/)
                var idt = id[2];
                idt = "ipt"+idt.substring(3,idt.length); TODO ESTO SE REEMPLAZA POR PARAMETRO*/
                var objid = evt.getSource().data("id");//Se obtiene el valor del parámetro enviado desde la vista "id"
                this.getView("View1").byId(objid).setValue("");
            },
            SetData: function (userData, wcdData, plantData, rmrksData, MidCondData, date, model, McDate) {

                var oView = this.getView("Index");
                var dataModel = model;
                var ctrllr = oView.getController();
                var obj = "";
                var UsrData = userData[0].data.results[0];
                dataModel.setProperty("/valDate", date);
                dataModel.setProperty("/valOpName", userData[0].data.results[0].NameTextc);
                dataModel.setProperty("/valUsrName", UsrData.Bname);
                dataModel.setProperty("/valMcdate", McDate);
                dataModel.setProperty("/valMandt", MidCondData[0].data.results[0].Mandt);

                //#region Jurisdiction and Control
                obj = oView.byId("ipt_JurCtrlChk21");
                dataModel.setProperty("/valJurCtrlChk", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, "",
                    MidCondData[0].data.results[0].Ckinf));
                //dataModel.setProperty("/valJurCtrlChk", MidNgthConSrv[0].data.results[0].Ckinf);

                switch (MidCondData[0].data.results[0].Cacin) {
                    case "SJFD":
                        dataModel.setProperty("/valJurCtrlCal", "keyJcChk1");
                        break;
                    case "POC":
                        dataModel.setProperty("/valJurCtrlCal", "keyJcChk2");
                        break;
                    default:
                        dataModel.setProperty("/valJurCtrlCal", "");
                        break;
                }
                //#endregion Jurisdiction and Control

                //#region Security Threat Levels
                var iconSec = oView.byId("SecThr_color");
                var iconDWR = oView.byId("SecDwr_color");
                switch (MidCondData[0].data.results[0].Natsec) {
                    case "NORMAL":
                        dataModel.setProperty("/valSecThrLvNat", "keyStlNat1");
                        iconSec.setBackgroundColor("green");
                        iconSec.setColor("green");
                        break;
                    case "ELEVATED":
                        dataModel.setProperty("/valSecThrLvNat", "keyStlNat2");
                        iconSec.setBackgroundColor("orange");
                        iconSec.setColor("orange");
                        break;
                    case "IMMINENT":
                        dataModel.setProperty("/valSecThrLvNat", "keyStlNat3");
                        iconSec.setBackgroundColor("red");
                        iconSec.setColor("red");
                        break;
                    default:
                        dataModel.setProperty("/valSecThrLvNat", "");
                        break;
                }

                switch (MidCondData[0].data.results[0].Dwrsec) {
                    case "NORMAL":
                        dataModel.setProperty("/valSecThrLvDwr", "keyStlDwr1");
                        iconDWR.setBackgroundColor("green");
                        iconDWR.setColor("green");
                        //var lbl = view.byId("lbl_SecThreatLvls_dwr_color");
                        //lbl.addStyleClass("cbx_green");
                        break;
                    case "ELEVATED":
                        dataModel.setProperty("/valSecThrLvDwr", "keyStlDwr2");
                        iconDWR.setBackgroundColor("orange");
                        iconDWR.setColor("orange");
                        //var lbl = view.byId("lbl_SecThreatLvls_dwr_color");
                        //lbl.addStyleClass("cbx_orange");
                        break;
                    case "IMMINENT":
                        dataModel.setProperty("/valSecThrLvDwr", "keyStlDwr3");
                        iconDWR.setBackgroundColor("red");
                        iconDWR.setColor("red");
                        //var lbl = view.byId("lbl_SecThreatLvls_dwr_color");
                        //lbl.addStyleClass("cbx_red");
                        break;

                    default:
                        dataModel.setProperty("/valSecThrLvDwr", "");
                        iconDWR.setBackgroundColor("");
                        iconDWR.setColor("");
                        break;
                }

                //#endregion Security Threat Levels.

                //#region LPPP
                switch (MidCondData[0].data.results[0].Cmode) {
                    case "REMOTE":
                        dataModel.setProperty("/valLpppCtrlMde", "keyLppp1");
                        break;
                    case "LOCAL":
                        dataModel.setProperty("/valLpppCtrlMde", "keyLppp2");
                        break;
                    default:
                        dataModel.setProperty("/valLpppCtrlMde", "");
                        break;
                }
                dataModel.setProperty("/valLpppFbayElv", MidCondData[0].data.results[0].Fbel);
                dataModel.setProperty("/valLpppRmrk", rmrksData[0].data.results[0].Remarka);

                //#endregion LPPP

                //#region BHPP

                switch (MidCondData[0].data.results[0].Cmodeb) {
                    case "REMOTE":
                        dataModel.setProperty("/valBhppCtrMde", "keyBhpp1");
                        break;
                    case "LOCAL":
                        dataModel.setProperty("/valBhppCtrMde", "keyBhpp2");
                        break;
                    default:
                        dataModel.setProperty("/valBhppCtrMde", "");
                        break;
                }

                dataModel.setProperty("/valBhppFbayEl", MidCondData[0].data.results[0].Fbelb);
                dataModel.setProperty("/valBhppRmrk", rmrksData[0].data.results[0].Remarkb);


                //#endregion BHPP

                //#region DEPP

                switch (MidCondData[0].data.results[0].Cmodec) {
                    case "REMOTE":
                        dataModel.setProperty("/valDeppCtrlMde", "keyDepp1");
                        break;
                    case "LOCAL":
                        dataModel.setProperty("/valDeppCtrlMde", "keyDepp2");
                        break;
                    default:
                        dataModel.setProperty("/valDeppCtrlMde", "");
                        break;
                }
                dataModel.setProperty("/valDeppFbayEl", MidCondData[0].data.results[0].Fbelc);
                dataModel.setProperty("/valDeppRmrk", rmrksData[0].data.results[0].Remarkc);


                //#endregion DEPP

                //#region BLPP

                switch (MidCondData[0].data.results[0].Cmoded) {
                    case "REMOTE":
                        dataModel.setProperty("/valBlppCtrMde", "keyBlpp1");
                        break;
                    case "LOCAL":
                        dataModel.setProperty("/valBlppCtrMde", "keyBlpp2");
                        break;
                    default:
                        dataModel.setProperty("/valBlppCtrMde", "");
                        break;
                }
                dataModel.setProperty("/valBlppFbayEl", MidCondData[0].data.results[0].Fbeld);
                dataModel.setProperty("/valBlppRmrk", rmrksData[0].data.results[0].Remarkd);
                //#endregion BLPP

                //#region POPP

                switch (MidCondData[0].data.results[0].Popcmode) {
                    case "REMOTE":
                        dataModel.setProperty("/valPoppCtrlMde", "keyPopp1");
                        break;
                    case "LOCAL":
                        dataModel.setProperty("/valPoppCtrlMde", "keyPopp2");
                        break;
                    default:
                        dataModel.setProperty("/valPoppCtrlMde", "");
                        break;
                }
                dataModel.setProperty("/valPoppFbayElv", MidCondData[0].data.results[0].Popfbeld);
                dataModel.setProperty("/valPoppRmrk", rmrksData[0].data.results[0].Popremarkd);
                //#endregion POPP

                //#region Tank Site
                obj = oView.byId("iptTnk1");
                dataModel.setProperty("/valTnkSite1", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign,
                    MidCondData[0].data.results[0].Tswl1));
                //dataModel.setProperty("/valTnkSite1", MidCondData[0].data.results[0].Tswl1);
                obj = oView.byId("iptTnk2");
                dataModel.setProperty("/valTnkSite2", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign,
                    MidCondData[0].data.results[0].Tswl2));
                //dataModel.setProperty("/valTnkSite2", MidCondData[0].data.results[0].Tswl2);
                obj = oView.byId("iptTnk3");
                dataModel.setProperty("/valTnkSite3", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign,
                    MidCondData[0].data.results[0].Tswl3));
                //dataModel.setProperty("/valTnkSite3", MidCondData[0].data.results[0].Tswl3);
                //#endregion Tank Site

                //#region BVPP

                switch (MidCondData[0].data.results[0].Cmodee) {
                    case "REMOTE":
                        dataModel.setProperty("/valBvppCtrlMde", "keyBvpp1");
                        break;
                    case "LOCAL":
                        dataModel.setProperty("/valBvppCtrlMde", "keyBvpp2");
                        break;
                    default:
                        dataModel.setProperty("/valBvppCtrlMde", "");
                        break;
                }
                dataModel.setProperty("/valBvppFbayElv", MidCondData[0].data.results[0].Fbele);
                dataModel.setProperty("/valBvppRmrk", rmrksData[0].data.results[0].Remarke);
                //#endregion BVPP

                //#region WRPP

                switch (MidCondData[0].data.results[0].Cmodef) {
                    case "REMOTE":
                        dataModel.setProperty("/valWrppCtrlMde", "keyWrpp1");
                        break;
                    case "LOCAL":
                        dataModel.setProperty("/valWrppCtrlMde", "keyWrpp2");
                        break;
                    default:
                        dataModel.setProperty("/valWrppCtrlMde", "");
                        break;
                }
                dataModel.setProperty("/valWrppFbayElv", MidCondData[0].data.results[0].Fbelf);
                dataModel.setProperty("/valWrppRmrk", rmrksData[0].data.results[0].Remarkf);

                //#endregion WRPP

                //#region WGPP

                switch (MidCondData[0].data.results[0].Cmodeg) {
                    case "REMOTE":
                        dataModel.setProperty("/valWgppCtrlMde", "keyWgpp1");
                        break;
                    case "LOCAL":
                        dataModel.setProperty("/valWgppCtrlMde", "keyWgpp2");
                        break;
                    default:
                        dataModel.setProperty("/valWgppCtrlMde", "");
                        break;
                }
                dataModel.setProperty("/valWgppFbayElv", MidCondData[0].data.results[0].Fbelg);
                dataModel.setProperty("/valWgppRmrk", rmrksData[0].data.results[0].Remarkg);

                //#endregion WGPP

                //#region EDPP

                switch (MidCondData[0].data.results[0].Cmodeh) {
                    case "REMOTE":
                        dataModel.setProperty("/valEdppCtrlMde", "keyEdpp1");
                        break;
                    case "LOCAL":
                        dataModel.setProperty("/valEdppCtrlMde", "keyEdpp2");
                        break;
                    default:
                        dataModel.setProperty("/valEdppCtrlMde", "");
                        break;
                }
                obj = oView.byId("iptEdppFbyElv");
                dataModel.setProperty("/valEdppFbayElv", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, "",
                    MidCondData[0].data.results[0].Fbelh));
                //dataModel.setProperty("/valEdppFbayElv", MidCondData[0].data.results[0].Fbelh);
                dataModel.setProperty("/valEdppRmrk", rmrksData[0].data.results[0].Remarkh);

                //#endregion EDPP
                obj = oView.byId("iptAqDlv2230");
                dataModel.setProperty("/valAqDelP2230", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign,
                    MidCondData[0].data.results[0].Pool2230));
                //dataModel.setProperty("/valAqDelP2230", MidCondData[0].data.results[0].Pool2230);
                obj = oView.byId("iptAqDlvKrnRvr");
                dataModel.setProperty("/valAqDelKrnRvr", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign,
                    MidCondData[0].data.results[0].Keirin));
                //dataModel.setProperty("/valAqDelKrnRvr", MidCondData[0].data.results[0].Keirin);
                obj = oView.byId("iptAqDlv3135");
                dataModel.setProperty("/valAqDelP3135", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign,
                    MidCondData[0].data.results[0].Pool3135));
                //dataModel.setProperty("/valAqDelP3135", MidCondData[0].data.results[0].Pool3135);
                obj = oView.byId("iptCoastAq");
                dataModel.setProperty("/valAqDelCstAq", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign,
                    MidCondData[0].data.results[0].Coaq));
                //dataModel.setProperty("/valAqDelCstAq", MidCondData[0].data.results[0].Coaq);
                obj = oView.byId("iptAqDlv36");
                dataModel.setProperty("/valAqDelP36", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign,
                    MidCondData[0].data.results[0].Pool36));
                //dataModel.setProperty("/valAqDelP36", MidCondData[0].data.results[0].Pool36);
                obj = oView.byId("iptAqDlv3740");
                dataModel.setProperty("/valAqDelP3740", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign,
                    MidCondData[0].data.results[0].Pool3740));
                //dataModel.setProperty("/valAqDelP3740", MidCondData[0].data.results[0].Pool3740);
                //#region Aqueduct Deliveries


                //#endregion Aqueduct Deliveries

                //#region Report Tables

                dataModel.setProperty("/val_wcd_table", wcdData[0].data.results);
                dataModel.setProperty("/val_plntt", plantData[0].data.results);

                //#endregion Report Tables
                return dataModel;
            },



            onSubmit: async function (UsrModel, data) {
                var oView = this.getView("Index");
                var oThat = this;
                MessageBox.confirm("Are you ready to submit?", {
                    view: oView,
                    that: oThat,
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: async function (sAction) {
                        if (sAction === "OK") {
                            var PostMidNgthConUrl = "/sap/opu/odata/sap/ZODATA_MC_WRSJ_SRV/";
                            var Service = new sap.ui.model.odata.ODataModel(PostMidNgthConUrl, true);
                            //var submitJson = this.view.getModel().getData();
                            var oView = this.that.getView("Index");
                            var submitJson = oView.getModel().getData();

                            //var oView = this.view;
                            var submitJsonRmrk = submitJson;


                            var now = new Date();
                            var oEntry = {};
                            oEntry.Mandt = submitJson.valMandt;
                            oEntry.Mcdate = submitJson.valMcdate;
                            //oEntry.Mctime = "PT" + now.getHours() + "H" + now.getMinutes() + "M" + now.getSeconds() + "S";
                            oEntry.Mctime = now.getHours().toString() + now.getMinutes().toString() + now.getSeconds().toString();
                            oEntry.Uname = submitJson.valUsrName;
                            oEntry.Natsec = oView.byId("cbx_SecThreatLvls_nat").getValue();
                            oEntry.Dwrsec = oView.byId("cbx_SecThreatLvls_dwr").getValue();
                            oEntry.Cacin = oView.byId("cbx_JurCtrlAqCtrl").getValue();
                            oEntry.Ckinf = this.that.delcomma(submitJson.valJurCtrlChk.toString());
                            oEntry.Cmode = oView.byId("cbxLpppCtrlMd").getValue();
                            oEntry.Fbel = this.that.delcomma(submitJson.valLpppFbayElv.toString());
                            oEntry.Remarka = submitJson.valMcdate + "WRSJ" + "REMARKA";
                            oEntry.Cmodeb = oView.byId("cbxBHppCtrlMd").getValue();
                            oEntry.Fbelb = this.that.delcomma(submitJson.valBhppFbayEl.toString());
                            oEntry.Remarkb = submitJson.valMcdate + "WRSJ" + "REMARKB";
                            oEntry.Cmodec = oView.byId("cbxDeppCtrlMd").getValue();
                            oEntry.Fbelc = this.that.delcomma(submitJson.valDeppFbayEl.toString());
                            oEntry.Remarkc = submitJson.valMcdate + "WRSJ" + "REMARKC";
                            oEntry.Cmoded = oView.byId("cbxBlppCtrlMd").getValue();
                            oEntry.Fbeld = this.that.delcomma(submitJson.valBlppFbayEl.toString());
                            oEntry.Remarkd = submitJson.valMcdate + "WRSJ" + "REMARKD";
                            oEntry.Popcmode = oView.byId("cbxPoppCtrlMd").getValue();
                            oEntry.Popfbeld = this.that.delcomma(submitJson.valPoppFbayElv.toString());
                            oEntry.Popremarkd = submitJson.valMcdate + "WRSJ" + "POPREMARKD";
                            oEntry.Tswl1 = this.that.delcomma(submitJson.valTnkSite1.toString());
                            oEntry.Tswl2 = this.that.delcomma(submitJson.valTnkSite2.toString());
                            oEntry.Tswl3 = this.that.delcomma(submitJson.valTnkSite3.toString());
                            oEntry.Cmodee = oView.byId("cbxBvppCtrlMd").getValue();
                            oEntry.Fbele = this.that.delcomma(submitJson.valBvppFbayElv.toString());
                            oEntry.Remarke = submitJson.valMcdate + "WRSJ" + "REMARKE";
                            oEntry.Cmodef = oView.byId("cbxWrppCtrlMd").getValue();
                            oEntry.Fbelf = this.that.delcomma(submitJson.valWrppFbayElv.toString());
                            oEntry.Remarkf = submitJson.valMcdate + "WRSJ" + "REMARKF";
                            oEntry.Cmodeg = oView.byId("cbxWgppCtrlMd").getValue();
                            oEntry.Fbelg = this.that.delcomma(submitJson.valWgppFbayElv.toString());
                            oEntry.Remarkg = submitJson.valMcdate + "WRSJ" + "REMARKG";
                            oEntry.Cmodeh = oView.byId("cbxEdppCtrlMd").getValue();
                            oEntry.Fbelh = this.that.delcomma(submitJson.valEdppFbayElv.toString());
                            oEntry.Remarkh = submitJson.valMcdate + "WRSJ" + "REMARKH";
                            oEntry.Pool2230 = this.that.delcomma(submitJson.valAqDelP2230.toString());
                            oEntry.Keirin = this.that.delcomma(submitJson.valAqDelKrnRvr.toString());
                            oEntry.Pool3135 = this.that.delcomma(submitJson.valAqDelP3135.toString());
                            oEntry.Coaq = this.that.delcomma(submitJson.valAqDelCstAq.toString());
                            oEntry.Pool36 = this.that.delcomma(submitJson.valAqDelP36.toString());
                            oEntry.Pool3740 = this.that.delcomma(submitJson.valAqDelP3740.toString());

                            var MidNgthCon = "";
                            var MidNgthConSrv = await this.that.postMidNgthConSrv(Service, oEntry);
                            if (MidNgthConSrv[0].result === "ERROR") {
                                MessageBox.error((MidNgthConSrv[0].data));
                            }
                            else {
                                var sserviceurlRmrks = "/sap/opu/odata/sap/ZODATA_MC_WRDTREM_SJ_01_SRV/";
                                var oModelRmrks = new sap.ui.model.odata.ODataModel(sserviceurlRmrks, true);
                                //var submitJsonRmrk = oView.getModel().getData();
                                var oEntryRmrks = {};


                                var oEntryRmrks = {};
                                oEntryRmrks.Zcwmremkey = submitJsonRmrk.valMcdate + "WRSJ";
                                oEntryRmrks.Remarka = oView.byId("rmkTxt_LpppRmrks").getValue();
                                oEntryRmrks.Remarkb = oView.byId("rmkTxtBhppRmrks").getValue();
                                oEntryRmrks.Remarkc = oView.byId("rmkTxtDeppRmrks").getValue();
                                oEntryRmrks.Remarkd = oView.byId("rmkTxtBlppRmrks").getValue();
                                oEntryRmrks.Popremarkd = oView.byId("rmkTxtPoppRmrks").getValue();
                                oEntryRmrks.Remarke = oView.byId("rmkTxtBvppRmrks").getValue();
                                oEntryRmrks.Remarkf = oView.byId("rmkTxtWrppRmrks").getValue();
                                oEntryRmrks.Remarkg = oView.byId("rmkTxtWgppRmrks").getValue();
                                oEntryRmrks.Remarkh = oView.byId("rmkTxtEdppRmrks").getValue();
                                var remarksSrv = await this.that.postRmrksSrv(oModelRmrks, oEntryRmrks);
                                if (remarksSrv[0].result === "ERROR") {
                                    MessageBox.error((remarksSrv[0].data));
                                }
                                else {
                                    //MessageBox.success("Data submitted successfully")
                                     var dataModel = this.that.getOwnerComponent().getModel("data");
                                    MessageBox.confirm("Data submitted successfully", {
                                        that1: this.that,
                                        view: oView,
                                        dataModelsbm:dataModel,
                                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                                        emphasizedAction: MessageBox.Action.OK,
                                        onClose: async function (sAction) {
                                            if (sAction === "OK") {
                                                var btnSb = this.that1.getView().byId("btn_Submit");
                                                //btnSb = view.byId("btn_Submit");
                                             
                                                btnSb.setEnabled(false);
                                                dataModel.setProperty("/valSubmitted", "This form has been submitted")
                                                //this.that1.onInit();
 
                                            }
                                        }
                                    })



                                }

                            }

                            //var vt1 = this.getView("View1").byId("chk_DvppTier1").getSelected();
                            //if (vt1 === true) {
                            //    oEntry.Tvop1 = "1";
                            //}
                            //else { oEntry.Tvop1 = ""; }
                        }
                    }
                });


            },
            delcomma: function (val) {
                var value = val;
                value = value.replace(/[^\d \+ \- \.]/g, "");

                return value
            },

            onBeforeRendering: function () {

                //jQuery.sap.delayedCall(500, this, function () {  this.byId("iptAqDlv2230").focus(); });
                // var dummy = "X";
            },
            onAfterRendering: function () {
                jQuery.sap.delayedCall(500, this, function () { this.byId("lbl_hdstate").focus(); });
                
            },
            attachAfterShow: function (onAfterShow) {
                this._afterShowDelegate = { onAfterShow };
                this.getView().addEventDelegate(this._afterShowDelegate, this);
            },
            onAfterShow: function () {
                this.byId("iptAqDlv2230").focus();
            },
        });


    });
