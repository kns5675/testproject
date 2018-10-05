// 작성자 : 전형준
var bandNum = 1;
var footer_height = 0;
var footerHeightInRegion = 0;
var minGroupBandDataHeight = 0;
var remainData = false;
var remainDataInRegion = false;
var numofData = 0;
var groupDataRow = 1;
var groupDataRowInRegion = 1;
var SubReport_Report_YN = false;
var SubReport_Report_Count = 1;
var SubReport_Report_Size;
var isMaximumRowCount = false;
var isMinimumRowCount = false;
var isBandGroupHeader = false;





/***********************************************************
 * 리포트에 밴드들을 그려줌(ChildBands 들을 그려주기 위해 재귀함수로 사용)
 * 인자 bands : 그려줄 밴드들 // layerName : 어느 Layer에 그려줄 지
 *
 * 수정 : 2018-08-22
 * BandData일 경우 페이지 크기에 맞게 BandData Height 변경
 * from 구영준
 *
 * 수정 : 2018-08-31
 * 그룹 헤더 밴드 구현
 * from 구영준
 *
 * 수정 : 2018-09-07
 *  데이터밴드의 자식 밴드들을 함수로 빼서 구현
 * from 안예솔
 **********************************************************/
function drawBand(bands, layerName, reportHeight, parentBand) {
    var avaHeight = 0;
    var dt;

    bands.some(function (band) {
        var doneDataBand = false;
        completeDataBand.forEach(function (compareDataBand) {
            if (compareDataBand == band.id) {
                doneDataBand = true;
            }
        });
        if (!doneDataBand) { // 출력이 끝난 데이터 밴드가 아닐 때
            switch (band.attributes["xsi:type"]) {
                case 'BandPageHeader' :
                    if (band.pageOutputSkip === "true" && reportPageCnt == 1) {
                        return false;
                    }
                    break;
                case 'BandTitle' :
                    if (reportPageCnt > 1) {
                        return false;
                    }
                    break;
                case 'BandData' :
                    dt = dataTable.DataSetName[band.dataTableName];
                    // 180910 YeSol 추가
                    var controlLists = [];
                    // var bands = report.layers.designLayer.bands;
                    controlLists.push(band.controlList.anyType); // dataBand의 controlList배열

                    isDynamicTable = false;
                    isFixedTable = false;
                    controlLists.forEach(function (controlList) {
                        if (controlList.length !== undefined) {
                            for (var i = 0; i < controlList.length; i++) {
                                if (controlList[i]._attributes['xsi:type'] == 'ControlDynamicTable') {
                                    isDynamicTable = true;
                                }
                                if (controlList[i]._attributes['xsi:type'] == 'ControlFixedTable') {
                                    isFixedTable = true;
                                }
                            }
                        } else {
                            if (controlList._attributes['xsi:type'] == 'ControlDynamicTable') {
                                isDynamicTable = true;
                            }
                            if (controlList._attributes['xsi:type'] == 'ControlFixedTable') {
                                isFixedTable = true;
                            }
                        }
                    });
                    break;
                case 'BandSummary' :
                    if (dt != undefined) {
                        if (band.isBottom == 'false') { // isBottom이 false면 맨 마지막 페이지에만 나옴
                            if (curDatarowInDataBand < dt.length && isDynamicTable == true) {
                                return false;
                            } else if (curDatarowInDataBand < dt.length && isFixedTable == true) {
                                return false;
                            }
                        }
                    }
                    break;
                case 'BandSubReport' :
                    return false;
                    break;
            }

            if (band.childHeaderBands !== null) { // 자식헤더밴드에서 재호출
                drawChildHeaderBand(band, layerName, reportHeight); // 자식 밴드를 그려주는 함수 호출
            }
            var div_id = 'band' + (bandNum++);

            // if (band.attributes["xsi:type"] !== "BandSubReport") {
            $('#' + layerName).append("<div id='" + div_id + "' class='Band " + band.attributes["xsi:type"] + "'>" + band.name + "</div>");
            // $("#"+div_id).css('pointer-events', 'none');
            if (SubReport_Report_YN) {    //서브리포트가 있을 경우
                if (band.attributes["xsi:type"] === "BandData") {
                }
                if (band.joinString) { //디테일 Where절이 있을 경우 기존 데이터 라벨 밑에 붙여야함.
                    judgementControlList(band, div_id, numofData); // 라벨을 그려줌
                }
            }
            if (band.attributes["xsi:type"] === "BandSubReport") {  // 서브리포트가 있으면 서브리포트를 카운트하고 해당 페이지 다음 페이지부터 서브리포트에 들어갈 리포트로 판단.
                SubReport_Report_YN = true;
                SubReport_Report_Count++;
                SubReport_Report_Size = band.rectangle.height;
            }

            switch (band.attributes["xsi:type"]) {
                case 'BandDataHeader' :
                    if (getAvaHeight(div_id, reportHeight) < Number(band.rectangle.height)) {
                        $('#' + div_id).remove();
                        return true;
                    }
                    setWidthHeightInBand(div_id, band);
                    break;
                case 'BandDummyHeader' :
                    if (getAvaHeight(div_id, reportHeight) < Number(band.rectangle.height)) {
                        $('#' + div_id).remove();
                        return true;
                    }
                        setWidthHeightInBand(div_id, band);
                    break;
                case 'BandGroupHeader' :
                    if (getAvaHeight(div_id, reportHeight) < Number(band.rectangle.height)) {
                        $('#' + div_id).remove();
                        return true;
                    }
                    inVisible(div_id, band);
                    setWidthHeightInBand(div_id, band);
                    break;
                case 'BandData' :
                    if (getAvaHeight(div_id, reportHeight) < Number(band.rectangle.height)) {
                        $('#' + div_id).remove();
                        return true;
                    }
                    if (bands.length > 1) {
                        if (isRegion) { // 리전일 때
                            getFooterHeightInRegion(bands, band);
                        } else { // 리전이 아닐 때
                            getFooterHeight(bands, band);
                        }
                    }
                    if (isRegion) { // 리전일 때
                        drawBandDataInRegion(groupFieldArrayInRegion, band, layerName, reportHeight, parentBand, div_id, dt);
                    } else { // 리전이 아닐 때
                        drawBandData(groupFieldArray, band, layerName, reportHeight, parentBand, div_id, dt);
                    }
                    break;
                case 'BandDummyFooter' :
                    avaHeight = getAvaHeight(div_id, reportHeight);
                    if (avaHeight < Number(band.rectangle.height)) {
                        if (isRegion) { // 리전일 때
                            remainFooterBandInRegion = (function (bands) {
                                var tempArr = [];
                                bands.forEach(function (band) {
                                    band.parentBand = parentBand;
                                    tempArr.push(band);
                                });
                                return tempArr;
                            }(bands));
                        } else { // 리전이 아닐 때
                            remainFooterBand = (function (bands) {
                                var tempArr = [];
                                bands.forEach(function (band) {
                                    band.parentBand = parentBand;
                                    tempArr.push(band);
                                });
                                return tempArr;
                            }(bands));
                            $('#' + div_id).remove();
                            return true;
                        }
                    }
                    setWidthHeightInBand(div_id, band);

                    break;
                case 'BandGroupFooter' :
                    avaHeight = getAvaHeight(div_id, reportHeight);
                    if (avaHeight < Number(band.rectangle.height)) {
                        band.parentBand = parentBand;
                        remainFooterBand.push(band);
                        $('#' + div_id).remove();
                        return false;
                    }
                    inVisible(div_id, band);
                    setWidthHeightInBand(div_id, band);

                    break;
                case 'BandSubReport' :
                    setWidthHeightInBand(div_id, band);
                    $('#' + div_id).css({
                        'border-bottom': "1px solid red",
                        'zIndex': -10
                    });
                    break;
                case 'BandPageFooter' :
                    setWidthHeightInBand(div_id, band);
                    $('#' + div_id).css({
                        //ToDo position이 absolute로 먹지 않음
                        'position': 'absolute',
                        'bottom': 0 + "px",
                    });
                    break;
                case 'BandSummary' :
                    if (band.isBottom == 'true') {
                        setWidthHeightInBand(div_id, band);
                        $('#' + div_id).css({
                            'border-bottom': "1px solid red",
                            'zIndex': -10
                        });
                    } else {
                        setWidthHeightInBand(div_id, band);
                        $('#' + div_id).css({
                            'border-bottom': "1px solid red",
                            'zIndex': -10
                        });
                        if (dt != undefined) {
                            if (curDatarowInDataBand > dt.length || isDynamicTable == false) { // 데이터 출력이 끝났을 때 나옴
                                setWidthHeightInBand(div_id, band);
                                $('#' + div_id).css({
                                    'border-bottom': "1px solid red",
                                    'zIndex': -10
                                });
                            }
                        }
                    }
                    break;
                default :
                    setWidthHeightInBand(div_id, band);
                    break;
            }
            if (band.attributes["xsi:type"] !== "BandSubReport") {
                if (band.attributes["xsi:type"] === "BandData") {
                    if (/*band.id == dataBand.id && */ !doneDataBand) {
                        dt = dataTable.DataSetName[band.dataTableName];
                        judgementControlList(band, div_id, numofData); // 라벨을 그려줌
                        afterjudgementControlListAction(band, div_id, layerName, reportHeight, parentBand, dt);
                    }
                } else {
                    dt = dataTable.DataSetName[band.dataTableName];
                    judgementControlList(band, div_id, numofData); // 라벨을 그려줌
                    afterjudgementControlListAction(band, div_id, layerName, reportHeight, parentBand, dt);
                }
            }

            if (band.childFooterBands !== null) { // 자식 풋터 밴드에서 재호출
                drawChildFooterBand(band, layerName, reportHeight); // 자식 밴드를 그려주는 함수 호출
            }

            if (band.attributes["xsi:type"] === "BandData") {
                dt = dataTable.DataSetName[ingDataTableName];
                dataBanIinitialize(band, dt);
            }


            }
    });
}

function dataBanIinitialize(band, dt){

    if (dt != undefined && curDatarowInDataBand >= dt.length) {
        curDatarowInDataBand = 0;
        tableLabelList = [];
        completeDataBand.push(band.id);
        ingDataTableName = undefined;
    }
}

/***********************************************************
 기능 : drawBand에서 Switch문 중 BandData에 해당하는 내용을 뽑아옴
 만든이 : 안예솔
 * *********************************************************/
function drawBandData(groupFieldArray, band, layerName, reportHeight, parentBand, div_id, dt) {
    if (groupFieldArray.length > 0 && band.childHeaderBands !== null) { //그룹 필드가 있는 경우
        var dataBandHeight = 0;
        if (isDynamicTable == true && dt != undefined) {
            avaHeight = getAvaHeight(div_id, reportHeight);
            numofData = getNumOfDataWithGroupField(band, avaHeight);


            if (band.controlList.anyType.FixRowCount !== undefined) { // 최대 행 개수
                var maximumRowCount = Number(band.controlList.anyType.FixRowCount._text);
                if (maximumRowCount != 0) {
                    if ((numofData - groupDataRow) > maximumRowCount) {
                        if (band.controlList.anyType.IsForceOverRow._text == 'true') { // 최대행 이후 데이터가 페이지 넘기기 일 때
                            numofData = maximumRowCount + 1;
                            isMaximumRowCount = true;
                        }
                    }
                }
            }
            if (band.controlList.anyType.MinimumRowCount !== undefined) {
                var minimumCnt = Number(band.controlList.anyType.MinimumRowCount._text);
                if (minimumCnt != 1 && (numofData - groupDataRow) < minimumCnt) { // 최소행 개수 적용
                    dataBandHeight = getBandHeightOfDataBand(band, minimumCnt);
                    isMinimumRowCount = true;
                } else {
                    if (remainData) {
                        dataBandHeight = getBandHeightOfDataBand(band, numofData - groupDataRow);
                    } else {
                        dataBandHeight = getBandHeightOfDataBand(band, numofData - 1);
                    }
                }
            } else {
                if (remainData) {
                    dataBandHeight = getBandHeightOfDataBand(band, numofData - groupDataRow);
                } else {
                    dataBandHeight = getBandHeightOfDataBand(band, numofData - 1);
                }
            }

            $('#' + div_id).css({
                'width': band.rectangle.width,
                'height': dataBandHeight,
                'overflow' : 'hidden'
            });
            inVisible(div_id, band);

        } else if (isFixedTable == true && dt != undefined) {
            avaHeight = getAvaHeight(div_id, reportHeight);
            // numofData = getNumOfDataWithGroupFieldInFixedTable(band, avaHeight);
        } else { // 테이블이 없을 때
            setWidthHeightInBand(div_id, band);
        }
    } else {  // 그룹 헤더/풋터가 없는 경우
        if (isDynamicTable == true && dt != undefined) {
            var dataBandFooterHeight = 0;
            avaHeight = getAvaHeight(div_id, reportHeight);
            numofData = getNumOfDataInOnePageNonObject(band, avaHeight);
            dataBandHeight = getBandHeightOfDataBand(band, numofData);

            if (band.childFooterBands !== null) { // 자식 풋터 밴드에서 재호출
                dataBandFooterHeight = getChildBandHeight(band);
            }
            $('#' + div_id).css({
                'width': band.rectangle.width,
                'height': dataBandHeight + 'px',
            });
            if (Array.isArray(band.controlList.anyType)) {
                band.controlList.anyType.forEach(function (anyType) {
                    if (anyType._attributes['xsi:type'] == 'ControlDynamicTable' && anyType.Labels !== undefined) {
                        numofData = getNumOfDataInOnePageNonObject(band, div_id);
                        if (band.controlList.anyType.MinimumRowCount !== undefined) { // 최소 행 개수
                            var minimumRowCount = Number(band.controlList.anyType.MinimumRowCount._text);
                            if ((dt.length - curDatarowInDataBand) < minimumRowCount && minimumRowCount != 1) {
                                numofData = minimumRowCount;
                                isMinimumRowCount = false;
                            }
                        }
                        if (band.controlList.anyType.FixRowCount !== undefined) { // 최대 행 개수
                            var maximumRowCount = Number(band.controlList.anyType.FixRowCount._text);

                            if (maximumRowCount != 0) {
                                if (band.controlList.anyType.IsForceOverRow._text == 'true') { // 최대행 이후 데이터가 페이지 넘기기 일 때
                                    numofData = maximumRowCount;
                                    isMaximumRowCount = true;
                                }
                            }
                        }
                    }
                });
            } else {
                if (band.controlList.anyType.Labels !== undefined) {
                    numofData = getNumOfDataInOnePageNonObject(band, div_id);
                    if (band.controlList.anyType.MinimumRowCount !== undefined) { // 최소 행 개수
                        var minimumRowCount = Number(band.controlList.anyType.MinimumRowCount._text);
                        if ((dt.length - curDatarowInDataBand) < minimumRowCount && minimumRowCount != 1) {
                            numofData = minimumRowCount;
                            isMinimumRowCount = true;
                        }
                    }
                    if (band.controlList.anyType.FixRowCount !== undefined) { // 최대 행 개수
                        var maximumRowCount = Number(band.controlList.anyType.FixRowCount._text);
                        if (maximumRowCount != 0) {
                            if (band.controlList.anyType.IsForceOverRow._text == 'true') { // 최대행 이후 데이터가 페이지 넘기기 일 때
                                numofData = maximumRowCount;
                                isMaximumRowCount = true;
                            }
                        }
                    }
                }
            }
        } else if (isFixedTable == false && isDynamicTable == false) { // 테이블이 없을 때
            setWidthHeightInBand(div_id, band);
        }
        if (isFixedTable == true && dt != undefined) { // 고정 테이블
            // TODO 여기 구현해야햄
            var dataBandFooterHeight = 0;
            avaHeight = getAvaHeight(div_id, reportHeight);
            numofData = getNumOfDataInOnePageNonObjectInFixedTable(band, avaHeight);
            dataBandHeight = (Number(band.rectangle.height._text)) * numofData;

            if (band.childFooterBands !== null) { // 자식 풋터 밴드에서 재호출
                dataBandFooterHeight = getChildBandHeight(band);
            }
            var divId = $('#' + div_id);
            divId.css({
                'width': band.rectangle.width,
                'height': dataBandHeight,
                'overflow' : 'hidden'
            });

            // numofData개수 만큼 BandData가 존재해야 함
            // numofData가 1이면 굳이 여러 개를 만들 필요가 없음
            if (numofData > 1) {
                for (var i = 0; i < numofData; i++) {
                    var fixedTabelDivId = div_id + 'fixedTable' + (curDatarow + i);
                    divId.append("<div id='" + fixedTabelDivId + "' class='Band " + band.attributes["xsi:type"] + "'>" + band.name + "</div>");
                    fixedTabelDivId = $('#' + fixedTabelDivId);
                    fixedTabelDivId.css({ // 만약에 top 을 줘야한다면  Number(band.Rectangle.Height._text) * i 를 top 값으로 주면 될 것 같음!
                        'width': band.rectangle.width,
                        'height': Number(band.rectangle.height._text),
                        'position': 'absolute',
                        'background-color': 'gray' // 잠시 넣었음 지워야햄
                    });
                }
            }
        } else if (isFixedTable == false && isDynamicTable == false) { // 테이블이 없을 때
            setWidthHeightInBand(div_id, band);
        }
    }
}


/***********************************************************
 기능 : drawBand에서 Switch문 중 BandData에 해당하는 내용을 뽑아옴 (리전)
 만든이 : 안예솔
 * *********************************************************/
function drawBandDataInRegion(groupFieldArrayInRegion, band, layerName, reportHeight, parentBand, div_id, dt) {
    if (groupFieldArrayInRegion.length > 0 && band.childHeaderBands !== null) { //그룹 필드가 있는 경우
        var dataBandHeight = 0;
        if (isDynamicTable == true && dt != undefined) {
            avaHeight = getAvaHeight(div_id, reportHeight);
            numofData = getNumOfDataWithGroupField(band, avaHeight);
            if (band.controlList.anyType.FixRowCount !== undefined) { // 최대 행 개수
                var maximumRowCount = Number(band.controlList.anyType.FixRowCount._text);
                if (maximumRowCount != 0) {

                    if ((numofData - groupDataRowInRegion) > maximumRowCount) {
                        if (band.controlList.anyType.IsForceOverRow._text == 'true') { // 최대행 이후 데이터가 페이지 넘기기 일 때
                            numofData = maximumRowCount + 1;
                            isMaximumRowCount = true;
                        }
                    }
                }
            }
            if (band.controlList.anyType.MinimumRowCount !== undefined) {
                var minimumCnt = Number(band.controlList.anyType.MinimumRowCount._text);
                if (minimumCnt != 1 && (numofData - groupDataRowInRegion) < minimumCnt) { // 최소행 개수 적용
                    dataBandHeight = getBandHeightOfDataBand(band, minimumCnt);
                    isMinimumRowCount = true;
                } else {
                    if (remainDataInRegion) {
                        dataBandHeight = getBandHeightOfDataBand(band, numofData - groupDataRowInRegion);
                    } else {
                        dataBandHeight = getBandHeightOfDataBand(band, numofData - 1);
                    }
                }
            } else {
                if (remainDataInRegion) {
                    dataBandHeight = getBandHeightOfDataBand(band, numofData - groupDataRowInRegion);
                } else {
                    dataBandHeight = getBandHeightOfDataBand(band, numofData - 1);
                }
            }
            $('#' + div_id).css({
                'width': band.rectangle.width,
                'height': dataBandHeight,
            });
            inVisible(div_id, band);
        } else if (isFixedTable == true && dt != undefined) {
            avaHeight = getAvaHeight(div_id, reportHeight);
            numofData = getNumOfDataWithGroupFieldInFixedTable(band, avaHeight);
        } else { // 동적 테이블이 없을 때
            setWidthHeightInBand(div_id, band);
        }
    } else {  // 그룹 헤더/풋터가 없는 경우
        if (isDynamicTable == true && dt != undefined) {
            var dataBandFooterHeight = 0;

            dataBandHeight = getAvaHeight(div_id, reportHeight);

            if (band.childFooterBands !== null) { // 자식 풋터 밴드에서 재호출
                dataBandFooterHeight = getChildBandHeight(band);
            }

            $('#' + div_id).css({
                'width': band.rectangle.width,
                'height': dataBandHeight - dataBandFooterHeight,
            });
            if (Array.isArray(band.controlList.anyType)) {
                band.controlList.anyType.forEach(function (anyType) {
                    if (anyType._attributes['xsi:type'] == 'ControlDynamicTable' && anyType.Labels !== undefined) {
                        numofData = getNumOfDataInOnePageNonObject(band, div_id);
                        if (band.controlList.anyType.MinimumRowCount !== undefined) { // 최소 행 개수
                            var minimumRowCount = Number(band.controlList.anyType.MinimumRowCount._text);
                            if ((dt.length - curDatarowInDataBand) < minimumRowCount && minimumRowCount != 1) {
                                numofData = minimumRowCount;
                                isMinimumRowCount = false;
                            }
                        }
                        if (band.controlList.anyType.FixRowCount !== undefined) { // 최대 행 개수
                            var maximumRowCount = Number(band.controlList.anyType.FixRowCount._text);

                            if (maximumRowCount != 0) {
                                if (band.controlList.anyType.IsForceOverRow._text == 'true') { // 최대행 이후 데이터가 페이지 넘기기 일 때
                                    numofData = maximumRowCount;
                                    isMaximumRowCount = true;
                                }
                            }
                        }
                    }
                });
            } else {
                if (band.controlList.anyType.Labels !== undefined) {
                    numofData = getNumOfDataInOnePageNonObject(band, div_id);
                    if (band.controlList.anyType.MinimumRowCount !== undefined) { // 최소 행 개수
                        var minimumRowCount = Number(band.controlList.anyType.MinimumRowCount._text);
                        if ((dt.length - curDatarowInRegion) < minimumRowCount && minimumRowCount != 1) {
                            numofData = minimumRowCount;
                            isMinimumRowCount = true;
                        }
                    }
                    if (band.controlList.anyType.FixRowCount !== undefined) { // 최대 행 개수
                        var maximumRowCount = Number(band.controlList.anyType.FixRowCount._text);
                        if (maximumRowCount != 0) {
                            if (band.controlList.anyType.IsForceOverRow._text == 'true') { // 최대행 이후 데이터가 페이지 넘기기 일 때
                                numofData = maximumRowCount;
                                isMaximumRowCount = true;
                            }
                        }
                    }
                }
            }
        } else if (isFixedTable == true && dt != undefined) { // 고정 테이블
            // TODO 여기 구현해야햄
            var dataBandFooterHeight = 0;
            avaHeight = getAvaHeight(div_id, reportHeight);
            numofData = getNumOfDataInOnePageNonObjectInFixedTable(band, avaHeight);
            dataBandHeight = (Number(band.rectangle.height._text)) * numofData;

            if (band.childFooterBands !== null) { // 자식 풋터 밴드에서 재호출
                dataBandFooterHeight = getChildBandHeight(band);
            }
            var divId = $('#' + div_id);
            divId.css({
                'width': band.rectangle.width,
                'height': dataBandHeight
            });

            // numofData개수 만큼 BandData가 존재해야 함
            // numofData가 1이면 굳이 여러 개를 만들 필요가 없음
            if (numofData > 1) {
                for (var i = 0; i < numofData; i++) {
                    var fixedTableDivId = div_id + 'fixedTable' + (curDatarow + i);
                    divId.append("<div id='" + fixedTableDivId + "' class='Band " + band.attributes["xsi:type"] + "'>" + band.name + "</div>");
                    var fixedTableDiv = $('#' + fixedTableDivId);
                    fixedTableDiv.css({ // 만약에 top 을 줘야한다면  Number(band.Rectangle.Height._text) * i 를 top 값으로 주면 될 것 같음!
                        'width': band.rectangle.width,
                        'height': Number(band.rectangle.height._text),
                        'position': 'absolute',
                        'background-color': 'gray' // 잠시 넣었음 지워야햄
                    });
                }
            }
        } else { // 동적 테이블이 없을 때
            setWidthHeightInBand(div_id, band);
        }
    }
}

/***********************************************************
 기능 : JudgementControlList 이후에 필요한 작업들
 만든이 : 구영준
 * *********************************************************/
function afterjudgementControlListAction(band, div_id, layerName, reportHeight, parentBand, dt) {
    switch (band.attributes["xsi:type"]) {
        case 'BandData' :
            isMaximumRowCount = false;
            isMinimumRowCount = false;
            if (isRegion) { // 리전일 때
                if (groupFieldArrayInRegion.length > 0 && band.childHeaderBands !== null) {
                    if (isDynamicTable == true && dt != undefined) {
                        var dataCount = groupFieldArrayInRegion[groupFieldNumInRegion].length;
                        var groupRemainData = (dataCount - groupDataRowInRegion);
                        if (numofData > groupRemainData) { // 마지막 페이지
                            curDatarow += groupFieldArrayInRegion[groupFieldNumInRegion].length - 1;
                            curDatarowInRegion += groupFieldArrayInRegion[groupFieldNumInRegion].length - 1;
                            remainDataInRegion = false;
                            completeDataBand.push(band.id);
                        } else { //마지막 페이지가 아닌 경우
                            remainDataInRegion = true;
                            if (numofData > groupDataRowInRegion) {
                                groupDataRowInRegion += (numofData - groupDataRowInRegion);
                            } else {
                                groupDataRowInRegion += numofData - 1;
                            }
                        }
                    }
                    if (isFixedTable == true && dt != undefined && numofData > 0) {
                        var dataCount = groupFieldArrayInRegion[groupFieldNumInRegion].length;
                        var groupRemainData = (dataCount - groupDataRowInRegion);
                        if (numofData > groupRemainData) { // 마지막 페이지
                            curDatarow += groupFieldArrayInRegion[groupFieldNumInRegion].length - 1;
                            curDatarowInRegion += groupFieldArrayInRegion[groupFieldNumInRegion].length - 1;
                            remainDataInRegion = false;
                            completeDataBand.push(band.id);
                        } else { //마지막 페이지가 아닌 경우
                            remainDataInRegion = true;
                            if (numofData > groupDataRowInRegion) {
                                groupDataRowInRegion += (numofData - groupDataRowInRegion);
                            } else {
                                groupDataRowInRegion += numofData - 1;
                            }
                        }
                    }
                } else { //그룹 필드가 아닐 경우
                    if (isDynamicTable == true && dt != undefined) {
                        curDatarowInRegion += numofData;
                        curDatarow += numofData;
                        if (curDatarowInRegion > dt.length) {
                            remainDataInRegion = false;
                        } else {
                            remainDataInRegion = true;
                        }
                        if (band.controlList.anyType.MinimumRowCount !== undefined) {
                            var minimumRowCount = Number(band.controlList.anyType.MinimumRowCount._text);
                            if (minimumRowCount != 1 && (dt.length - curDatarowInRegion) < minimumRowCount) {
                                numofData = minimumRowCount;
                            }
                        }
                    }
                    if (isFixedTable == true && dt != undefined && numofData > 0) {
                        // curDatarowInRegion += numofData;
                        curDatarow += numofData;
                        if (curDatarowInRegion > dt.length) {
                            remainDataInRegion = false;
                        } else {
                            remainDataInRegion = true;
                        }
                        if (band.controlList.anyType.MinimumRowCount !== undefined) {
                            var minimumRowCount = Number(band.controlList.anyType.MinimumRowCount._text);
                            if (minimumRowCount != 1 && (dt.length - curDatarowInRegion) < minimumRowCount) {
                                numofData = minimumRowCount;
                            }
                        }
                    }
                }
            } else { // 리전이 아닐 때
                if (groupFieldArray.length > 0 && band.childHeaderBands !== null) {
                    if (isDynamicTable == true && dt != undefined && numofData > 0) { //그룹일 경우
                        var dataCount = groupFieldArray[groupFieldNum].length;
                        var groupRemainData = (dataCount - groupDataRow);
                        if(groupDataRow >= numofData){
                            if (numofData >= groupRemainData) { // 마지막 페이지
                                curDatarow += groupFieldArray[groupFieldNum].length - 1;
                                curDatarowInDataBand += groupFieldArray[groupFieldNum].length - 1;
                                remainData = false;
                                ingDataTableName = band.dataTableName;
                            }else{ //첫 페이지 or 중간 페이지
                                remainData = true;
                                groupDataRow += (numofData - groupDataRow);
                                ingDataTableName = band.dataTableName;
                            }
                        }else{
                            if (numofData + groupDataRow > dataCount) { // 마지막 페이지
                                curDatarow += groupFieldArray[groupFieldNum].length - 1;
                                curDatarowInDataBand += groupFieldArray[groupFieldNum].length - 1;
                                remainData = false;
                                ingDataTableName = band.dataTableName;
                            } else { //마지막 페이지가 아닌 경우
                                remainData = true;
                                groupDataRow += (numofData - groupDataRow);
                                ingDataTableName = band.dataTableName;
                            }
                        }
                    } else if (isFixedTable == true && dt != undefined && numofData > 0) { // TODO 뭔가 이상해..
                        var dataCount = groupFieldArray[groupFieldNum].length;
                        var groupRemainData = (dataCount - groupDataRow);
                        if (numofData > groupRemainData) { // 마지막 페이지
                            if(curDatarowInDataBand >= dt.length) {
                                curDatarow += groupFieldArray[groupFieldNum].length - 1;
                                curDatarowInDataBand = 0;
                                remainData = false;
                                completeDataBand.push(band.id);
                                ingDataTableName = undefined;
                            }else{
                                curDatarow += groupFieldArray[groupFieldNum].length - 1;
                                curDatarowInDataBand += groupFieldArray[groupFieldNum].length - 1;
                                remainData = false;
                                ingDataTableName = band.dataTableName;
                            }
                        } else { //마지막 페이지가 아닌 경우
                            remainData = true;
                            if (numofData > groupDataRow) {
                                groupDataRow += (numofData - groupDataRow);
                            } else {
                                groupDataRow += numofData - 1;
                            }
                            ingDataTableName = band.dataTableName;
                        }
                    }
                } else { //그룹 필드가 아닐 경우
                    if (isDynamicTable == true && dt != undefined && numofData > 0) {
                        curDatarowInDataBand += numofData;
                        curDatarow += numofData;
                        ingDataTableName = band.dataTableName;

                        if (band.controlList.anyType.MinimumRowCount !== undefined) {
                            var minimumRowCount = Number(band.controlList.anyType.MinimumRowCount._text);
                            if (minimumRowCount != 1 && (dt.length - curDatarowInDataBand) < minimumRowCount) {
                                numofData = minimumRowCount;
                            }
                        }
                    } else if (isFixedTable == true && dt != undefined && numofData > 0) {
                        // curDatarowInDataBand += numofData;
                        curDatarow += numofData;
                        if (curDatarowInDataBand >= dt.length) {
                            remainData = false;
                            curDatarowInDataBand = 0;
                            tableLabelList = [];
                            completeDataBand.push(band.id);
                        } else {
                            remainData = true;
                        }
                        if (band.controlList.anyType.MinimumRowCount !== undefined) {
                            var minimumRowCount = Number(band.controlList.anyType.MinimumRowCount._text);
                            if (minimumRowCount != 1 && (dt.length - curDatarowInDataBand) < minimumRowCount) {
                                numofData = minimumRowCount;
                            }
                        }
                    }
                }
            }
            break;
        case 'BandGroupFooter' :
            if (isRegion) { // 리전일 때
                if (groupFieldArrayInRegion.length > 0) /*&& band.childHeaderBands !== null)*/ {
                    if (isDynamicTable == true && dt != undefined && numofData > 0) {
                        var dataCount = groupFieldArrayInRegion[groupFieldNumInRegion].length;
                        var groupRemainData = (dataCount - groupDataRowInRegion);
                        if (numofData-groupDataRow >= groupRemainData) { // 마지막 페이지
                            if (remainData && (groupFieldNumInRegion == groupFieldArrayInRegion.length - 1)) {
                                groupFieldNumInRegion = 0;
                                groupDataRowInRegion = 1;
                            } else if (!remainData && (groupFieldNumInRegion == groupFieldArrayInRegion.length - 1)) {
                                remainDataInRegion = false;
                            } else {
                                groupFieldNumInRegion++;
                                groupDataRowInRegion = 1;
                                isBandGroupHeader = false;
                            }
                        }
                    } else if (isFixedTable == true && dt != undefined && numofData > 0) {
                        var dataCount = groupFieldArrayInRegion[groupFieldNumInRegion].length;
                        var groupRemainData = (dataCount - groupDataRowInRegion);
                        if (numofData-groupDataRow >= groupRemainData) { // 마지막 페이지
                            if (remainData && (groupFieldNumInRegion == groupFieldArrayInRegion.length - 1)) {
                                groupFieldNumInRegion = 0;
                                groupDataRowInRegion = 1;
                            } else if (!remainData && (groupFieldNumInRegion == groupFieldArrayInRegion.length - 1)) {
                                remainDataInRegion = false;
                            } else {
                                groupFieldNumInRegion++;
                                groupDataRowInRegion = 1;
                                isBandGroupHeader = false;
                            }
                        }
                    }
                }

                if (dt != undefined) {
                    if (curDatarowInRegion < dt.length) {
                        if (band.forceNewPage === 'true') { //페이지 넘기기

                        } else {
                            if (!Array.isArray(dataBand)) {
                                var tempDataBand = [];
                                tempDataBand.push(dataBand);
                                drawBand(tempDataBand, layerName, reportHeight);
                            }
                        }
                    }
                }
            } else { // 리전이 아닐 때
                if (groupFieldArray.length > 0) /*&& band.childHeaderBands !== null)*/ {
                    if (isDynamicTable == true && dt != undefined && numofData > 0) {
                        var dataCount = groupFieldArray[groupFieldNum].length;
                        var groupRemainData = (dataCount - groupDataRow);
                        if (numofData-groupDataRow >= groupRemainData) { // 마지막 페이지
                            groupFieldNum++;
                            groupDataRow = 1;
                            isBandGroupHeader = false;
                        }
                    } else if (isFixedTable == true && dt != undefined && numofData > 0) {
                        var dataCount = groupFieldArray[groupFieldNum].length;
                        var groupRemainData = (dataCount - groupDataRow);
                        if (numofData-groupDataRow >= groupRemainData) { // 마지막 페이지
                            groupFieldNum++;
                            groupDataRow = 1;
                            isBandGroupHeader = false;
                        }
                    }
                }

                /**************************************************************************************
                 * 그룹 풋터 일 경우
                 *
                 * 페이지 넘기기가 true 면 그룹 풋터 밴드가 그려지고 페이지가 끝
                 *                 false면 데이터 밴드가 다시 그려짐
                 *
                 * 데이터 밴드가 다시 그려질 때,
                 * 현재 페이지에서 여유 공간 = 리포트 길이 = 그룹 풋터 밴드 상위의 밴드 길이 - 풋터 밴들 길이
                 *
                 * 최소 그룹데이터 길이 = 그룹헤더길이 + 동적테이블 title Height  + 동적테이블 value Height 길이
                 *
                 * 여유 공간이 최소 그룹데이터 길이보다 클 경우
                 * 다시 데이터 밴드 그림
                 *
                 * 만든 사람 : 구영준...
                 *
                 **************************************************************************************/
                parentBand = (parentBand === undefined ? band.parentBand : parentBand);
                if (dt != undefined) {
                    if (curDatarowInDataBand < dt.length) {
                        if (band.forceNewPage === 'true') { //페이지 넘기기

                        } else {
                            if (getAvaHeight(div_id, reportHeight) - footer_height > Number(parentBand.childHeaderBands[0].rectangle.height)) {
                                parentBand = (function (arg) {
                                    var band = [];
                                    band.push(arg);
                                    return band;
                                })(parentBand);
                                if(curDatarowInDataBand < dt.length){
                                    drawBand(parentBand, layerName, reportHeight, band);
                                }
                            }
                        }
                    }
                }
            }
            break;
    }
}

/***********************************************************
 기능 : 그룹 헤더/풋터 밴드들의 inVisible 속성 구현
 만든이 : 구영준
 **********************************************************/
function inVisible(div_id, band) {
    if (band.invisible === 'true') {
        $('#' + div_id).css({
            'width': band.rectangle.width,
            'height': 0,
            'display': 'none'
        });

    }
}

/***********************************************************
 기능 : 밴드들의 Width와 Height inVisible 속성 구현
 만든이 : 구영준
 **********************************************************/
function setWidthHeightInBand(div_id, band) {
    $('#' + div_id).css({
        'width': band.rectangle.width,
        'height': band.rectangle.height,
        'overflow' : 'hidden'
    });
}


/***********************************************************
 기능 : 밴드들의 childHeaderBand를 그린다.
 만든이 : 안예솔
 ***********************************************************/
function drawChildHeaderBand(band, layerName, reportHeight) {

    var childHeaderBandArray = new Array();
    var childBands = band.childHeaderBands;

    childBands.forEach(function (childBand) {
        switch (childBand.attributes["xsi:type"]) {
            case 'BandGroupHeader' :
                if (isRegion) { // 리전일 때
                    if (!remainDataInRegion) {
                        if (!isBandGroupHeader) {
                            childHeaderBandArray.push(childBand);
                        }
                        isBandGroupHeader = true;
                    } else {
                        if (band.fixPriorGroupHeader === 'true') { //그룹 헤더 고정
                            childHeaderBandArray.push(childBand);
                        }
                    }
                } else { // 리전이 아닐 때
                    if (!remainData) {
                        if (!isBandGroupHeader) {
                            childHeaderBandArray.push(childBand);
                        }
                        isBandGroupHeader = true;
                    } else {
                        if (band.fixPriorGroupHeader === 'true') { //그룹 헤더 고정
                            childHeaderBandArray.push(childBand);
                        }
                    }
                }
                break;
            case 'BandDataHeader' : // 데이터 헤더 밴드
                if (band.fixTitle == 'true') { // 데이터 헤더 밴드 고정 값이 '예'일 때
                    childHeaderBandArray.push(childBand); // 매 페이지마다 나와야 함
                } else { // 데이터 헤더 밴드 고정 값이 '아니오'일 때
                    if (reportPageCnt == 1) { // 첫 페이지만 나옴
                        childHeaderBandArray.push(childBand);
                    }
                }
                break;
            case 'BandDummyHeader' :
                var isGroupHeader = false;
                childBands.forEach(function (childBand) {
                    if (childBand.attributes["xsi:type"] == 'BandGroupHeader') {
                        isGroupHeader = true;
                    }
                });
                if (isGroupHeader) { // 그룹 헤더가 있을 때는 그룹의 맨 처음에 출력 O
                    if (isRegion) { // 리전일 때
                        if (groupDataRowInRegion == 1) {
                            childHeaderBandArray.push(childBand);
                        }
                    } else { // 리전이 아닐 때
                        if (groupDataRow == 1) {
                            childHeaderBandArray.push(childBand);
                        }
                    }
                } else { // 그룹 헤더가 없을 때는 인쇄물의 첫 페이지에만 출력
                    if (reportPageCnt == 1) {
                        childHeaderBandArray.push(childBand);
                    }
                }

                break;
        }
    });
    drawBand(childHeaderBandArray, layerName, reportHeight);
}

/***********************************************************
 기능 : 밴드들의 childFooterBand를 그린다.
 만든이 : 안예솔
 * *********************************************************/
function drawChildFooterBand(band, layerName, reportHeight) {
    var childFooterBandArray = new Array();
    var childBands = band.childFooterBands;
    var dt = dataTable.DataSetName[band.dataTableName];
    childBands.forEach(function (childBand) {
        switch (childBand.attributes["xsi:type"]) {
            case 'BandGroupFooter' :
                if (isRegion) { // 리전일 때
                    if (!remainDataInRegion) {
                        childFooterBandArray.push(childBand);
                    } else {
                        if (band.fixPriorGroupFooter == 'true') { //그룻 풋터 고정
                            childFooterBandArray.push(childBand);
                        }
                    }
                } else {
                    if (!remainData) { // 리전이 아닐 때
                        childFooterBandArray.push(childBand);
                    } else {
                        if (band.fixPriorGroupFooter == 'true') { //그룻 풋터 고정
                            childFooterBandArray.push(childBand);
                        }
                    }
                }
                break;
            case 'BandDataFooter' : // 모든 데이터 출력이 끝난 후에 출력
                if (dt == undefined) {
                    childFooterBandArray.push(childBand); // 매 페이지마다 나와야 함
                } else {
                        if (isRegion) { // 리전일 때
                            if (curDatarowInRegion >= dt.length || isDynamicTable == false) { // 데이터 출력이 끝났을 때 나옴
                                childFooterBandArray.push(childBand);
                            }
                        } else { // 리전이 아닐 때
                            if (curDatarowInDataBand >= dt.length || isDynamicTable == false) { // 데이터 출력이 끝났을 때 나옴
                                childFooterBandArray.push(childBand);
                            }
                    }
                }
                break;
            case 'BandDummyFooter' :
                var isGroupFooter = false;
                childBands.forEach(function (childBand) {
                    if (childBand.attributes["xsi:type"] == 'BandGroupFooter') {
                        isGroupFooter = true;
                    }
                });
                if (isGroupFooter) { // 그룹 헤더가 있을 때는 그룹의 맨 마지막에 출력
                    if (isRegion) { // 리전일 때
                        if (!remainDataInRegion) { // 출력할 그룹의 데이터가 남아있지 않을 때 O
                            childFooterBandArray.push(childBand);
                        }
                    } else { // 리전이 아닐 때
                        if (!remainData && !remainDataInRegion) { // 출력할 그룹의 데이터가 남아있지 않을 때 O
                            childFooterBandArray.push(childBand);
                        }
                    }
                } else { // 그룹 헤더가 없을 때는 인쇄물의 마지막 페이지에만 출력
                    if (isRegion) { // 리전일 때
                        if (curDatarowInRegion > dt.length) { // 데이터 출력이 끝났을 때 나옴
                            childFooterBandArray.push(childBand);
                        }
                    } else { // 리전이 아닐 때
                        if (!remainData && !remainDataInRegion) { // 출력할 그룹의 데이터가 남아있지 않을 때 O
                            if (groupFieldArrayInRegion != undefined && groupFieldArrayInRegion.length != 0) {
                                if ((groupFieldArrayInRegion.length - 1) == groupFieldNumInRegion) {
                                    childFooterBandArray.push(childBand);
                                }
                            } else {
                            }
                        }
                    }
                }
                break;
        }
    });
    drawBand(childFooterBandArray, layerName, reportHeight, band);
}

