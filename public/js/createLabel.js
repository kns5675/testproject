document.write("<script type='text/javascript' src='/js/label.js' ><" + "/script>");
document.write("<script type='text/javascript' src='/js/figure.js' ><" + "/script>");
document.write("<script type='text/javascript' src='/js/additionalControl.js' ><" + "/script>");

var labelList = [];
var tableLabelList = [];
var fixTableLabelList = [];
var tableList = [];
var fixTableList = [];
var systemLabelNum = 1;
var summaryLabelNum = 1;
var dataLabelNum = 1;
var normalLabelNum = 1;
var expressionNum = 1;
var groupLabelNum = 1;
var parameterLabelNum = 1;
var tableTitleLabelNum = 1;
var tableValueLabelNum = 1;
var dateNum = 1;
var timeNum = 1;
var dateTimeNum = 1;
var pageNumberNum = 1;
var pageNumTotalPageNum = 1;
var totalPageNum = 1;
var groupFieldNum = 0; // 그룹으로 묶었을 경우 BandGroupHeader에서 DataLabel을 사용했을 때 몇 번째 그룹이 출력중인지 알 수 있는 변수
var tableNum = 1;
var dynamicTableNum = 1;
var fixedTableNum = 1; // 지연추가
var dynamicTitleLabelNum = 1;
var thNum = 1;
var dynamicValueLabelNum = 1;
//var fixedValueLabelNum =1; //지연추가
var fixedTableLabelNum = 1; //지연추가
var groupFieldArray = [];
var titleArray = []; // 그룹으로 묶었을 경우 titleName으로만 접근이 가능해져서 그 titleName을 담을 배열
var regionNum = 1;
var fixTableRowCount = 0;

var row = 0;
var verticalPNum = 0;
var plusRowNum = 0;

/******************************************************************
 기능 : ControlList의 유무를 판단하는 함수를 만든다.
 만든이 : 안예솔
 ******************************************************************/
function judgementControlList(band, divId, numOfData) {
    if (band.groupFieldArray !== undefined) {
        groupFieldArray = band.groupFieldArray;
    }
    if (!(band.controlList.anyType === undefined)) { // ControlList 태그 안에 뭔가가 있을 때
        var controlList = band.controlList.anyType;
        if (Array.isArray(controlList)) {
            controlList.forEach(function (list) {
                judgementLabel(list, divId, numOfData, band);
            });
        } else {
            judgementLabel(controlList, divId, numOfData, band);
        }
    } else {
    }
}

/******************************************************************
 기능 : 어떤 Label인지를 판단하여 객체를 생성해주는 함수를 만든다.
 만든이 : 안예솔

 수정 : 하지연
 날짜 : 2018-09-18
 수정 내용 : 고정테이블 else if 부분 수정
 ******************************************************************/
function judgementLabel(data, divId, numOfData, band) {
    var attr = data._attributes["xsi:type"];
    var band_name = band.attributes["xsi:type"];
    if (attr == "ControlDynamicTable") { // 동적 테이블
        var controlDynamicTable = new Table(data);
        tableList.push(controlDynamicTable);
        var tableLabels = data.Labels.TableLabel;
        tableLabels.forEach(function (label, i) {
            var tableLabel = new DynamicTableLabel(label, i);
            if (tableLabelList.length < tableLabels.length) { //영준 수정
                tableLabelList.push(tableLabel);
            }
        });
        drawingDynamicTable(controlDynamicTable, tableLabelList, divId, numOfData, band);
    } else if (attr == "ControlFixedTable") { // 고정 테이블일때
        /*
        ToDo : 하나의 페이지에 고정테이블이 2개 이상 있을 경우 fixTableLabelList에 겹침
         */
        var controlFixedTable = new Table(data);
        // tableList.push(controlFixedTable);
        fixTableList.push(controlFixedTable);
        var fixTableLabels = data.Labels.TableLabel;
        var fixTableLabelList = [];

        if(fixTableLabels){
            fixTableLabels.forEach(function (label, i) {
                var fixtableLabel = new FixedTableLabel(label, i);
                if (fixTableLabelList.length < fixTableLabels.length) { // 수정 : 하지연
                    fixTableLabelList.push(fixtableLabel);
                }
            });
        }
        drawingFixedTable(data, controlFixedTable, fixTableLabelList, divId, numOfData,fixTableList);//numOfData추가.
    } else if (attr == "ControlLabel") {
        if (!(data.DataType === undefined)) {
            switch (data.DataType._text) {
                case "SummaryLabel" : // 요약 라벨
                    var label = new SummaryLabel(data);
                    labelList.push(label);
                    drawingSummaryLabel(label, divId);
                    break;
                case "DataLabel" : // 데이터 라벨
                    var label = new DataLabel(data);
                    labelList.push(label);
                    drawingDataLabel(label, divId);
                    break;
                case "Expression" : // 수식 라벨
                    var label = new Expression(data);
                    labelList.push(label);
                    drawingExpression(label, divId);
                    break;
                case "GroupLabel" : // 그룹 라벨
                    var label = new GroupLabel(data);
                    labelList.push(label);
                    drawingGroupLabel(label, divId);
                    break;
                case "ParameterLabel" : // 파라미터 라벨
                    var label = new ParameterLabel(data);
                    labelList.push(label);
                    drawingParameterLabel(label, divId);
                    break;
                case "SystemLabel" : // 시스템 라벨
                    var label = new SystemLabel(data);
                    labelList.push(label);
                    drawingSystemLabel(label, divId);
                    break;
            }
        } else {
            var label = new NormalLabel(data);
            labelList.push(label);
            drawingNormalLabel(label, divId, band_name);
        }
    } else if (attr == 'ControlRectangle') { // 사각형
        var figure = new ControlRectangle(data);
        drawingRectangle(figure, divId);
    } else if (attr == 'ControlCircle') { // 원
        var figure = new ControlCircle(data);
        drawingCircle(figure, divId);
    } else if (attr == 'ControlLine') { // 선
        var figure = new ControlLine(data);
        drawingLine(figure, divId);
    } else if (attr == 'ControlArrow') { // 화살표
        var figure = new ControlArrow(data);
        drawingArrow(figure, divId);
    } else if (attr == 'ControlRadioButton') { // 라디오 버튼
        var additionalControl = new ControlRadioButton(data);
        drawingRadioButton(additionalControl, divId);
    } else if (attr == 'ControlCheckBoxButton') { // 체크 박스
        var additionalControl = new ControlCheckBoxButton(data);
        drawingCheckBox(additionalControl, divId);
    } else if (attr == 'ControlRegion') { // 리전
        // TODO 리전ㅠㅠ
        var regionControl = new ControlRegion(data);
        drawingRegion(regionControl, divId);
    }
}

function drawingRegion(data, divId) {
    var div = $('#' + divId);

    div.css('position', 'relative');

    div.append('<div id = "region' + regionNum + '"></div>');

    var regionDiv = $('#region' + regionNum);

    regionDiv.css({
        // 'margin-top': data.margin.x + 'px',
        // 'margin-bottom': data.margin.y + 'px',
        // 'margin-right': data.margin.height + 'px',
        // 'margin-left': data.margin.width + 'px',
        'left': data.rectangle.x + 'px',
        'top': data.rectangle.y + 'px',
        'width': data.rectangle.width + 'px',
        'height': data.rectangle.height + 'px',
        'position': 'absolute',
        'background-color': 'rgba(255, 0, 0, 0)',
        'border': '1px solid black',
        'z-index': 0
    });
    var regionName = 'resion' + regionNum;
    var regionHeight = data.rectangle.height;

    var bands = data.layer.bands;
    var dataBandIndex = 0;

    drawBand(bands, regionName, regionHeight);

    // var layerName = "designLayer" + pageNum;
    // var reportHeight = report.rectangle.height;
    // if(remainFooterBand.length > 0){
    //     var bands = report.layers.designLayer.bands;
    //     var dataBandIndex = 0;
    //
    //     bands.forEach(function(band, i){
    //         if(band.attributes["xsi:type"] == "BandData"){
    //             dataBandIndex = i;
    //         }
    //     });
    //
    //     var returnBands = bands.injectArray(dataBandIndex, remainFooterBand);
    //
    //     returnBands.forEach(function(band, i){
    //         if(band.attributes["xsi:type"] == "BandData"){
    //             dataBandIndex = i;
    //         }
    //     });
    //
    //     returnBands.splice(dataBandIndex, 1);
    //
    //     drawBand(returnBands, layerName, reportHeight);
    //     remainFooterBand = [];
    // }else{
    //     drawBand(report.layers.designLayer.bands, layerName, reportHeight); // 추가 - 전형준
    // }
    // if(report){
    //     drawSubReport(report.layers.designLayer.bands, layerName, reportHeight);
    // }else{
    //     drawBand(report.layers.designLayer.bands, layerName, reportHeight); // 추가 - 전형준
    // }


}

/******************************************************************
 부모의 position이 relative이고 자식의 position이 absolute일 때
 부모를 기준으로 자식의 위치를 잡을 수 있다.
 ******************************************************************/

/******************************************************************
 기능 : DynamicTable(동적 테이블)을 화면에 그려주는 함수를 만든다.
 만든이 : 안예솔

 수정 : DynamicTableValueLabel에 데이터 바인딩
 Date : 2018-08-20
 From 구영준

 수정 : DynamicTable의 th, td tag에 클래스 추가
 Date : 2018-08-24
 From 전형준

 수정 : 테이블의 크기 조정, 위치 이동, 내용 수정 추가.
 Date : 2018-08-27
 From hagdung-i
 ******************************************************************/
function drawingDynamicTable(table, tableLabel, divId, numOfData, band) {
    var div = $('#' + divId);
    div.append('<div id = "Table' + tableNum + '"></div>');
    var divIdTable = $('#Table' + tableNum);
    divIdTable.append('<div id="dynamicTable_resizing_div_packing' + dynamicTableNum + '"></div>');
    var dynamicTable_resizing_div_packing = $("#dynamicTable_resizing_div_packing" + dynamicTableNum);
    dynamicTable_resizing_div_packing.append('<div id="dynamicTable_resizing_div' + dynamicTableNum + '"></div>');
    var dynamicTable_resizing_div = $("#dynamicTable_resizing_div" + dynamicTableNum);
    var temp_table_class = table.id.substring(0, 4); // 임시로 table을 인식하기 위한 번호 - 전형준
    dynamicTable_resizing_div.append('<table id="dynamicTable' + dynamicTableNum + '" class="table table-' + temp_table_class + '"></table>');
    // dynamicTable_resizing_div.addClass("NormalLabel_scope");
    div.css('position', 'relative');

    dynamicTable_resizing_div.css({
        'position': 'absolute',
        'left': table.rectangle.x + 'px',
        'top': table.rectangle.y + 'px',
    });

    var tableId = $('#dynamicTable' + dynamicTableNum);
    Lock_Check_Table(table, dynamicTable_resizing_div, tableId, div);
    // table_format_check(table, dynamicTable_resizing_div, tableId, div);
    tableId.css({
        'width': table.rectangle.width + 'px',
        'height': table.rectangle.height + 'px'
    });
    tableId.append('<tr id = "dynamicTitleLabel' + dynamicTitleLabelNum + '"></tr>');

    var dt = dataTable.DataSetName[band.dataTableName];
    var header_Name_Number = 1;

    if (Array.isArray(tableLabel)) {
        tableLabel.forEach(function (label) {
            switch (label._attributes) {
                case "DynamicTableTitleLabel" :
                    drawingDynamicTableTitleLabel(label, header_Name_Number);
                    header_Name_Number++;
                    break;
                case "DynamicTableValueLabel" :
                    drawingDynamicTableValueLabel(label, dt, tableId, numOfData, table);
                    break;
            }
        });
        tableId.css({
            'border': '1px solid red',
            'border-collapse': 'collapse',
            'text-align': 'center',
            'table-layout': 'fixed'
        });

        tableNum++;
        dynamicTableNum++;
        thNum++;
        dynamicTitleLabelNum++;
        dynamicValueLabelNum++;
    }
}

/**************************************************************************************
 기능 : GroupFieldArray가 없을 경우
 DynamicTableValueLabel(동적 테이블 밸류 라벨)을 화면에 그려주는 함수를 만든다.
 만든이 : 구영준
 **************************************************************************************/
function drawingDynamicTableValueLabelWithoutGroupFieldArray(label, dt, tableId, numOfData, table) {
    var rowLength = curDatarowInDataBand + numOfData; //한 페이지에 마지막으로 출력해야할 row
    // var thCnt = tableId.find('th').length;
    var tempCurDataRow = curDatarow;
    for (var j = curDatarowInDataBand; j < rowLength; j++) {
        var data = dt[j];

        var minimumRow = false;
        var valueTrId = $("#dynamicValueLabel" + tempCurDataRow);
        if (valueTrId.length < 1) {
            tableId.append('<tr id = "dynamicValueLabel' + tempCurDataRow + '"></tr>');
        }
        if ((j >= dt.length) && table.minimumRowCount !== undefined) { // 최소행 개수
            if (table.minimumRowCount != 1) { // 최소행 개수 1이 기본 값임
                data = dt[j - table.minimumRowCount];
                minimumRow = true;
            }
        }
        if (label.dataType === 'ParameterLabel') {
            paramTable.NewDataSet.Table1.forEach(function (paramData) {
                if (label.parameterName == paramData.Key._text) {
                    label.text = paramData.Value._text;
                }
            });
            var valueTrId = $('#dynamicValueLabel' + tempCurDataRow);
            var tdId = 'tableValueLabelNum' + tableValueLabelNum++;
            var key = label.parameterName;
            if (!minimumRow) {
                valueTrId.append('<td id = "' + tdId + '" class="' + key + ' Label ' + label._attributes + ' ' + label.dataType + '">' + label.text + '</td>');
            } else { // 최소행 개수
                valueTrId.append('<td id = "' + tdId + '" class="' + key + ' Label ' + label._attributes + ' ' + label.dataType + '"></td>');
            }
            valueTrId.css({
                'width': label.rectangle.width,
                'height': label.rectangle.height
            });
            var td = $('.' + key);
            //// 추가 부분 18.08.28 YeSol
            if (label.noBorder == 'true') {
                td.css('border', 'none');
            } else {
                if (label.borderThickness !== undefined) {
                    var leftBorder = borderDottedLine(label.borderDottedLines.leftDashStyle);
                    var rightBorder = borderDottedLine(label.borderDottedLines.rightDashStyle);
                    var bottomBorder = borderDottedLine(label.borderDottedLines.bottomDashStyle);
                    var topBorder = borderDottedLine(label.borderDottedLines.topDashStyle);
                    td.css({
                        'border-left': label.borderThickness.left + 'px ' + leftBorder + ' ' + label.leftBorderColor,
                        'border-right': label.borderThickness.right + 'px ' + rightBorder + ' ' + label.rightBorderColor,
                        'border-bottom': label.borderThickness.bottom + 'px ' + bottomBorder + ' ' + label.bottomBorderColor,
                        'border-top': label.borderThickness.top + 'px ' + topBorder + ' ' + label.topBorderColor
                    });
                } else {
                    td.css('border', '1px solid black');
                }
            }
            td.css({
                'font-size': label.fontSize,
                'font-family': label.fontFamily,
                'font-weight': label.fontStyle,
                'font-color': label.textColor,
                'background-color': label.backGroundColor,
                'white-space': 'nowrap'
            });
            drd_javascript(label, tdId, label.startBindScript);
            tempCurDataRow++;
        } else {
            for (var key in data) {
                if (label.fieldName == key) {
                    var valueTrId = $('#dynamicValueLabel' + tempCurDataRow);
                    var key_data = data[key]._text;
                    var table_reform = table_format_check(data, valueTrId, key_data, table);
                    var tdId = 'tableValueLabelNum' + tableValueLabelNum++;
                    if (!minimumRow) {
                        if (label.labelTextType == 'Number' && label.format != undefined) {
                            valueTrId.append('<td id = "' + tdId + '" class="' + key + ' Label ' + label._attributes + ' ' + label.dataType + ' ' + "MoneySosu" + '">' + table_reform + '</td>');
                        } else {
                            valueTrId.append('<td id = "' + tdId + '" class="' + key + ' Label ' + label._attributes + ' ' + label.dataType + '">' + table_reform + '</td>');
                        }
                    } else { // 최소행 개수
                        valueTrId.append('<td id = "' + tdId + '" class="' + key + ' Label ' + label._attributes + ' ' + label.dataType + '"></td>');
                    }
                    valueTrId.css({
                        'width': label.rectangle.width,
                        'height': label.rectangle.height
                    });

                    if (label.dataType == 'GroupLabel' && j == numOfData - 1 && label.grouppingRule == 'Merge') { // 그룹 라벨
                        var i = 0;
                        var tableValueLabelNum2 = tableValueLabelNum - 1;

                        for (i; i < j - groupDataRow; i++) {
                            var groupLabel = $('#tableValueLabelNum' + (tableValueLabelNum2 - i));
                            var priorGroupLabel = $('#tableValueLabelNum' + (tableValueLabelNum2 - (i + 1)));

                            if ((groupLabel.attr('class') == priorGroupLabel.attr('class')) && groupLabel.text() == priorGroupLabel.text()) {
                                groupLabelNum++;
                                groupLabel.remove();
                                if (groupLabelNum == (j - groupDataRow + 1)) {
                                    priorGroupLabel.attr('rowspan', groupLabelNum);
                                }
                            } else {
                                if (groupLabelNum != 1) {
                                    groupLabel.attr('rowspan', groupLabelNum);
                                    groupLabelNum = 1;
                                }
                            }
                        }
                    }
                    var td = $('.' + key);
                    //// 추가 부분 18.08.28 YeSol
                    if (label.noBorder == 'true') {
                        td.css('border', 'none');
                    } else {
                        if (label.borderThickness !== undefined) {
                            var leftBorder = borderDottedLine(label.borderDottedLines.leftDashStyle);
                            var rightBorder = borderDottedLine(label.borderDottedLines.rightDashStyle);
                            var bottomBorder = borderDottedLine(label.borderDottedLines.bottomDashStyle);
                            var topBorder = borderDottedLine(label.borderDottedLines.topDashStyle);
                            td.css({
                                'border-left': label.borderThickness.left + 'px ' + leftBorder + ' ' + label.leftBorderColor,
                                'border-right': label.borderThickness.right + 'px ' + rightBorder + ' ' + label.rightBorderColor,
                                'border-bottom': label.borderThickness.bottom + 'px ' + bottomBorder + ' ' + label.bottomBorderColor,
                                'border-top': label.borderThickness.top + 'px ' + topBorder + ' ' + label.topBorderColor
                            });
                        } else {
                            td.css('border', '1px solid black');
                        }
                    }
                    td.css({
                        'font-size': label.fontSize,
                        'font-family': label.fontFamily,
                        'font-weight': label.fontStyle,
                        'font-color': label.textColor,
                        'background-color': label.backGroundColor,
                        'white-space': 'nowrap'
                    });
                    drd_javascript(label, tdId, label.startBindScript);
                }
            }
            tempCurDataRow++;
        }
    }
}

/**************************************************************************************
 기능 : GroupFieldArray가 있을 경우
 DynamicTableValueLabel(동적 테이블 밸류 라벨)을 화면에 그려주는 함수를 만든다.
 만든이 : 구영준
 **************************************************************************************/
function drawingDynamicTableValueLabelWithGroupFieldArray(label, dt, tableId, numOfData, table) {
    var minimumRow = false;
    var data = groupFieldArray[groupFieldNum];
    if (table.minimumRowCount !== undefined && isMinimumRowCount == true) {
        var minimumCnt = Number(table.minimumRowCount);
        if (minimumCnt != 1 && (numOfData - groupDataRow) < minimumCnt) { // 최소행 개수 적용
            numOfData = numOfData + minimumCnt - (numOfData - groupDataRow);
            minimumRow = true;
        }
    }
    var groupLabelNum = 1;
    for (var j = groupDataRow; j < numOfData; j++) {
        var temp = j;

        var rowNum = curDatarow + j;

        if (minimumRow && data[j] === undefined) {
            temp = data.length - 1;
            rowNum += 'min';
        }

        var $trId = '#dynamicValueLabel' + rowNum;
        var valueTrId = $($trId);

        if (valueTrId.length < 1) {
            tableId.append('<tr id =   "dynamicValueLabel' + rowNum + '"></tr>');
        }
        // TODO 수정 해야할 부분이 있을 것 같음
        if (label.dataType === 'ParameterLabel') {
            paramTable.NewDataSet.Table1.forEach(function (paramData) {
                if (label.parameterName == paramData.Key._text) {
                    label.text = paramData.Value._text;
                }
            });
            // var valueTrId = $('#dynamicValueLabel' + tempCurDataRow);
            var tdId = 'tableValueLabelNum' + tableValueLabelNum++;
            var key = label.parameterName;
            if (!minimumRow) {
                valueTrId.append('<td id = "' + tdId + '" class="' + key + ' Label ' + label._attributes + ' ' + label.dataType + '">' + label.text + '</td>');
            } else { // 최소행 개수
                valueTrId.append('<td id = "' + tdId + '" class="' + key + ' Label ' + label._attributes + ' ' + label.dataType + '"></td>');
            }
            valueTrId.css({
                'width': label.rectangle.width,
                'height': label.rectangle.height
            });
            var td = $('.' + key);
            //// 추가 부분 18.08.28 YeSol
            if (label.noBorder == 'true') {
                td.css('border', 'none');
            } else {
                if (label.borderThickness !== undefined) {
                    var leftBorder = borderDottedLine(label.borderDottedLines.leftDashStyle);
                    var rightBorder = borderDottedLine(label.borderDottedLines.rightDashStyle);
                    var bottomBorder = borderDottedLine(label.borderDottedLines.bottomDashStyle);
                    var topBorder = borderDottedLine(label.borderDottedLines.topDashStyle);
                    td.css({
                        'border-left': label.borderThickness.left + 'px ' + leftBorder + ' ' + label.leftBorderColor,
                        'border-right': label.borderThickness.right + 'px ' + rightBorder + ' ' + label.rightBorderColor,
                        'border-bottom': label.borderThickness.bottom + 'px ' + bottomBorder + ' ' + label.bottomBorderColor,
                        'border-top': label.borderThickness.top + 'px ' + topBorder + ' ' + label.topBorderColor
                    });
                } else {
                    td.css('border', '1px solid black');
                }
            }
            td.css({
                'font-size': label.fontSize,
                'font-family': label.fontFamily,
                'font-weight': label.fontStyle,
                'font-color': label.textColor,
                'background-color': label.backGroundColor,
                'white-space': 'nowrap'
            });
            drd_javascript(label, tdId, label.startBindScript);
        } else {
            for (var key in data[temp]) {
                valueTrId = $($trId);
                if (label.fieldName == key) {
                    var key_data = data[temp][key]._text;
                    var table_reform = table_format_check(data, valueTrId, key_data, label);

                    var tdId = 'tableValueLabelNum' + tableValueLabelNum++;
                    if (minimumRow && (j > data.length)) {
                        valueTrId.append(
                            '<td id = "' + tdId + '" class="' + key + ' Label ' + label._attributes + ' ' + label.dataType + '"></td>'
                        );
                    } else {
                        if (label.labelTextType == 'Number' && label.format != undefined) {
                            valueTrId.append(
                                '<td id = "' + tdId + '" class="' + key + ' Label ' + label._attributes + ' ' + label.dataType + ' ' + "MoneySosu" + '">' + table_reform + '</td>'
                            );
                        } else {
                            valueTrId.append(
                                '<td id = "' + tdId + '" class="' + key + ' Label ' + label._attributes + ' ' + label.dataType + '">' + table_reform + '</td>'
                            );
                        }
                    }
                    valueTrId.css({
                        'width': label.rectangle.width,
                        'height': label.rectangle.height,

                    });
                    if (label.dataType == 'GroupLabel' && j == numOfData - 1 && label.grouppingRule == 'Merge') { // 그룹 라벨
                        var i = 0;
                        var tableValueLabelNum2 = tableValueLabelNum - 1;

                        for (i; i <= j - groupDataRow; i++) {
                            var groupLabel = $('#tableValueLabelNum' + (tableValueLabelNum2 - i));
                            var priorGroupLabel = $('#tableValueLabelNum' + (tableValueLabelNum2 - (i + 1)));

                            if ((groupLabel.attr('class') == priorGroupLabel.attr('class')) && groupLabel.text() == priorGroupLabel.text()) {
                                groupLabelNum++;
                                groupLabel.remove();
                                if (groupLabelNum == (j - groupDataRow + 1)) {
                                    priorGroupLabel.attr('rowspan', groupLabelNum);
                                }
                            } else {
                                if (groupLabelNum != 1) {
                                    groupLabel.attr('rowspan', groupLabelNum);
                                    groupLabelNum = 1;
                                }
                            }
                        }
                    }

                    var td = $('.' + key);
                    //// 추가 부분 18.08.28 YeSol
                    if (label.noBorder == 'true') {
                        td.css('border', 'none');
                    } else {
                        if (label.borderThickness !== undefined) {
                            var leftBorder = borderDottedLine(label.borderDottedLines.leftDashStyle);
                            var rightBorder = borderDottedLine(label.borderDottedLines.rightDashStyle);
                            var bottomBorder = borderDottedLine(label.borderDottedLines.bottomDashStyle);
                            var topBorder = borderDottedLine(label.borderDottedLines.topDashStyle);

                            td.css({
                                'border-left': label.borderThickness.left + 'px ' + leftBorder + ' ' + label.leftBorderColor,
                                'border-right': label.borderThickness.right + 'px ' + rightBorder + ' ' + label.rightBorderColor,
                                'border-bottom': label.borderThickness.bottom + 'px ' + bottomBorder + ' ' + label.bottomBorderColor,
                                'border-top': label.borderThickness.top + 'px ' + topBorder + ' ' + label.topBorderColor
                            });
                        } else {
                            td.css('border', '1px solid black');
                        }
                    }

                    td.css({
                        // 'border': '1px solid black',
                        'font-size': label.fontSize,
                        'font-family': label.fontFamily,
                        'font-weight': label.fontStyle,
                        'background-color': label.backGroundColor,
                        'white-space': 'nowrap'
                    });
                    drd_javascript(label, tdId, label.startBindScript);
                }
            }
        }
    }
}

/******************************************************************
 기능 : DynamicTableValueLabel(동적 테이블 밸류 라벨)을 화면에 그려주는 함수를 만든다.
 만든이 : 구영준

 수정 : 숫자 표시 형식 추가, 테이블 데이터 그러주는 방식 수정.
 Date : 2018-08-29
 From hagdung-i
 *******************************************************************/
function drawingDynamicTableValueLabel(label, dt, tableId, numOfData, table) {
    if(dt == undefined) { //without DataTable in DataBand
        drawingDynamicTableValueLabelWithOutDataTable(label, tableId);
    }else{
        if (groupFieldArray == undefined || groupFieldArray.length == 0) {
            drawingDynamicTableValueLabelWithoutGroupFieldArray(label, dt, tableId, numOfData, table);
        } else {
            drawingDynamicTableValueLabelWithGroupFieldArray(label, dt, tableId, numOfData, table);
        }
    }
}

/**************************************************************************************
 기능 : 동적테이블이에 데이터 테이블이 없을 경우 데이터 바인딩 없이 ValueLabel을 그려줌
 만든이 : 구영준
 **************************************************************************************/
function drawingDynamicTableValueLabelWithOutDataTable(label, tableId){
    tableId.append('<tr id = "dynamicValueLabel' + dynamicValueLabelNum + '"></tr>');
    var valueTrId = $("#dynamicValueLabel" + dynamicValueLabelNum);

    valueTrId.append('<td id = "tableValueLabelNum' + tableValueLabelNum + '"></td>');
    valueTrId.css({
        'width': label.rectangle.width,
        'height': label.rectangle.height
    });

    var tdId = $('#tableValueLabelNum' + tableValueLabelNum++);

    setCssInTable(label, tdId);

    tdId.append(label.text);
    tdId.addClass('Label DynamicTableHeader');
    tdId.addClass(label._attributes);

    drd_javascript(label, tdId, label.startBindScript);

}

/**************************************************************************************
 기능 : 동적테이블이에 Css  세팅
 만든이 : 구영준
 **************************************************************************************/
function setCssInTable(label, tdId){
    //// 추가 부분 18.08.28 YeSol
    if (label.noBorder == 'true') {
        tdId.css('border', 'none');
    } else {
        if (label.borderThickness !== undefined) {
            var leftBorder = borderDottedLine(label.borderDottedLines.leftDashStyle);
            var rightBorder = borderDottedLine(label.borderDottedLines.rightDashStyle);
            var bottomBorder = borderDottedLine(label.borderDottedLines.bottomDashStyle);
            var topBorder = borderDottedLine(label.borderDottedLines.topDashStyle);
            tdId.css({
                'border-left': label.borderThickness.left + 'px ' + leftBorder + ' ' + label.leftBorderColor,
                'border-right': label.borderThickness.right + 'px ' + rightBorder + ' ' + label.rightBorderColor,
                'border-bottom': label.borderThickness.bottom + 'px ' + bottomBorder + ' ' + label.bottomBorderColor,
                'border-top': label.borderThickness.top + 'px ' + topBorder + ' ' + label.topBorderColor
            });
        } else {
            tdId.css('border', '1px solid black');
        }
    }

    tdId.css({
        'background-color': label.backGroundColor,
        'font-size': label.fontSize,
        'font-family': label.fontFamily,
        'font-weight': label.fontStyle,
        'font-color': label.textColor,
        'width': label.rectangle.width + 'px',
        'height': label.rectangle.height + 'px',
        'white-space': 'nowrap'
    });

}


/******************************************************************
 기능 : DynamicTableTitleLabel(동적 테이블 타이틀 라벨)을 화면에 그려주는 함수를 만든다.
 만든이 : 구영준

 수정 : 테이블 id 값 한글 생성되는 부분 수정.
 Date : 2018-08-28
 From hagdung-i

 수정 : TitleLabel 그려주는 함수 key값과 비교 없이 출력
 Date : 2018-09-18
 From 구영준


 *******************************************************************/
function drawingDynamicTableTitleLabel(label, header_Name_Number) {
    var titleTrId = $('#dynamicTitleLabel' + dynamicTitleLabelNum);

    titleTrId.append('<th id = "DynamicTableTitleLabel' + header_Name_Number + '_View_Page_Number' + thNum + '"></th>');
    titleTrId.css({
        'width': label.rectangle.width,
        'height': label.rectangle.height
    });
    var thId = $('#DynamicTableTitleLabel' + header_Name_Number + "_View_Page_Number" + thNum);

    setCssInTable(label, thId);

    thId.append(label.text);
    thId.addClass('Label DynamicTableHeader');
    thId.addClass(label._attributes);
    table_column_controller(thId, titleTrId);

    drd_javascript(label, thId, label.startBindScript);
}

/******************************************************************
 기능 : FixedTable(고정 테이블)을 화면에 그려주는 함수를 만든다.
 만든이 : 하지연
 ******************************************************************/
function drawingFixedTable(data, controlFixedTable, fixTableLabelList, divId, numOfData,fixTableList) {

    var div = $('#' + divId);//divId = 밴드
    div.css('position', 'relative');
    div.css('border','1px solid blue');

    div.append('<div id = "Table' + tableNum + '"></div>');//무의미한 테이블 div
    var divIdTable = $('#Table' + tableNum);
    divIdTable.css({
        'position':'absolute',
        'top':0
    });

    var temp_table_class = controlFixedTable.id.substring(0, 4); // 임시로 table을 인식하기 위한 번호 - 전형준

    divIdTable.append('<table id="fixedTable' + fixedTableNum + '" class="table table-' + temp_table_class + '"></table>');
    var fixTableId = $('#fixedTable' + fixedTableNum);//고정테이블
    fixTableId.css({
        'width': controlFixedTable.rectangle.width,
        'height': controlFixedTable.rectangle.height,
        'border-spacing':0,
        'padding':0,
        'left': controlFixedTable.rectangle.x + 'px',
        'top': controlFixedTable.rectangle.y + 'px'
    });

    if(groupFieldArray.length < 1) {
        numOfData = getNumOfDataInOnePage(fixTableLabelList, divId); //한 페이지에 들어갈 데이터 개수라는데 잘 모르게씀.
    }else{
        var dt = Object.values(dataTable.DataSetName)[0];

        var fixTableWidth = Number((fixTableId.css('width')).replace(/[^0-9]/g,""));//고정테이블 width 값
        var fixTableLabelListLength = Number(fixTableLabelList.length);//고정테이블 라벨리스트 라벨 갯수

        function setRowCount(){
            var labelWidth =0;//라벨너비
            var labelCount = 0;//라벨개수
            var rowCount = 0;//row개수

            if(data.Labels) {//라벨 리스트 라벨 width, height값 가져오기
                for (var i = 0; i < fixTableLabelListLength; i++) {
                    var thisWidth = Number(fixTableLabelList[i].rectangle.width);
                    var thisHeight = Number(fixTableLabelList[i].rectangle.height);
                    labelCount++;

                    labelWidth += thisWidth;
                    if (fixTableWidth == (labelWidth)) {
                        rowCount++;

                        for (var rC = 1; rC <= rowCount; rC++) {
                            fixTableId.append('<tr id = "fixedTableRow' + fixTableRowCount + '"></tr>');
                            var ThisfixedTableRow = $("#fixedTableRow" + fixTableRowCount);

                            ThisfixedTableRow.css({
                                'border-spacing': 0,
                                'margin': 0,
                                'padding': 0,
                                'top': 0,
                                'width': '100%',
                                'height': thisHeight,
                            });
                            var tdId = 'FixedTableLabel_';
                            for (var rC2 = 1; rC2 <= labelCount; rC2++) {
                                var fromData = fixTableLabelList[rC2 - 1];
                                ' + fixedTableNum + '
                                switch (fromData.dataType) {
                                    case  "DataLabel" :
                                        if (groupFieldArray !== undefined) {
                                            ThisfixedTableRow.append('<td class="DataLabel" id = "' + tdId + rC2 +'_'+fixedTableNum+'">' + groupFieldArray[groupFieldNum][0] + '</td>');
                                            //ThisfixedTableRow.append(groupFieldArray[groupFieldNum][0]);
                                            settingAttribute(fromData, tdId, rC2, thisWidth, thisHeight);
                                        }
                                        break;
                                    case  "NormalLabel" :
                                        if (groupFieldArray !== undefined) {
                                            ThisfixedTableRow.append('<td class="NormalLabel" id = "' + tdId + rC2 +'_'+fixedTableNum+'">' + fromData.text + '</td>');
                                            //ThisfixedTableRow.append(groupFieldArray[groupFieldNum][0]);
                                            settingAttribute(fromData, tdId, rC2, thisWidth, thisHeight);
                                        }
                                        break;
                                }
                            }
                        }
                        fixTableRowCount++;
                    }
                }
            }
        }

        setRowCount();


        if (Array.isArray(fixTableLabelList)) {
            fixTableLabelList.forEach(function (label) {
                switch (label._attributes) {
                    case "FixedTableLabel" :
                        var temp = Object.keys(dt[0]);
                        //console.log("temp : ",temp);
                        //console.log("case1들어옴! + temp : " + temp);  //날짜,품명,단가,수량,금액,이름,DRDSEQ
                        var titleTrId = $('#fixedTableLabel' + fixedTableLabelNum);
                        var header_Name_Number = 1;
                        temp.forEach(function (titleName) {

                        });
                        if (groupFieldArray == undefined || groupFieldArray.length == 0) {
                            drawingFixedTableValueLabelWithoutGroupFieldArray(label, dt, fixTableId, numOfData, controlFixedTable);
                        } else {
                            drawingFixedTableValueLabelWithGroupFieldArray(label, dt, fixTableId, numOfData);
                        }
                        break;

                    default :
                        break;
                }
            });
            fixTableId.css({
                'position':'absolute',
                'text-align': 'center',
                'z-index' :999,
                'width': controlFixedTable.rectangle.width,
                'height': controlFixedTable.rectangle.height,
                'left': controlFixedTable.rectangle.x + 'px',
                'top': controlFixedTable.rectangle.y + 'px'
            });

            tableNum++;
            fixedTableNum++;
            thNum++;
            fixedTableLabelNum++;
        }
    }
}
/******************************************************************
 기능 : 고정테이블 안의 FixedTableLabel의 속성을 구현하고, 적용시킨다.
 만든이 : 하지연
 ******************************************************************/
function settingAttribute(fromData, tdId, rC2, thisWidth, thisHeight){
    var ThisFixedTableData = $("#" + tdId + rC2+'_'+fixedTableNum);

    if(fromData.visible =='false'){
        ThisFixedTableData.css('display','none');
    }if(fromData.visible =='false'){//visible 속성
        ThisFixedTableData.css('display', 'none');
    }
    if (fromData.noBorder == 'true') {//border 없을때
        ThisFixedTableData.css('border', 'none');

        ThisFixedTableData.css({
            'width': thisWidth,
            'height': thisHeight,
            'float': 'left',
            'background-color': fromData.backGroundColor,
            'font-size': fromData.fontSize,
            'font-family': fromData.fontFamily,
            'font-weight': fromData.fontStyle,
            'padding': 0,
            'white-space': 'nowrap'
        });
    } else {//border 있을때
        if (fromData.borderThickness !== undefined) {
            var leftBorder = borderDottedLine(fromData.borderDottedLines.leftDashStyle);
            var rightBorder = borderDottedLine(fromData.borderDottedLines.rightDashStyle);
            var bottomBorder = borderDottedLine(fromData.borderDottedLines.bottomDashStyle);
            var topBorder = borderDottedLine(fromData.borderDottedLines.topDashStyle);

            ThisFixedTableData.css({
                'border-left': fromData.borderThickness.left + 'px ' + leftBorder + ' ' + fromData.leftBorderColor,
                'border-right': fromData.borderThickness.right + 'px ' + rightBorder + ' ' + fromData.rightBorderColor,
                'border-bottom': fromData.borderThickness.bottom + 'px ' + bottomBorder + ' ' + fromData.bottomBorderColor,
                'border-top': fromData.borderThickness.top + 'px ' + topBorder + ' ' + fromData.topBorderColor
            });
            var borderWidth = Number((ThisFixedTableData.css('border-width')).replace(/[^0-9]/g, ""));
            var borderLWidth = Number((ThisFixedTableData.css('border-left-width')).replace(/[^0-9]/g, ""));
            var borderRWidth = Number((ThisFixedTableData.css('border-right-width')).replace(/[^0-9]/g, ""));
            var borderTWidth = Number((ThisFixedTableData.css('border-top-width')).replace(/[^0-9]/g, ""));
            var borderBWidth = Number((ThisFixedTableData.css('border-bottom-width')).replace(/[^0-9]/g, ""));

            ThisFixedTableData.css({
                'width': thisWidth - borderLWidth - borderRWidth,
                'height': thisHeight - borderTWidth - borderBWidth,
                'float': 'left',
                'background-color': fromData.backGroundColor,
                'font-size': fromData.fontSize,
                'font-family': fromData.fontFamily,
                'font-weight': fromData.fontStyle,
                'padding': 0,
                'border-collapse': 'collapse',
                'white-space': 'nowrap'
            });
        }
    }
    if(fromData.wordWrap=='true'){
        ThisFixedTableData.css('white-space','normal');
    }
}
/**************************************************************************************
 기능 : GroupFieldArray가 없을 경우
 FixedTableValueLabel(고정 테이블 밸류 라벨)을 화면에 그려주는 함수를 만든다.
 만든이 : 하지연
 **************************************************************************************/
function drawingFixedTableValueLabelWithoutGroupFieldArray(label, dt, tableId, numOfData, table){
    console.log("without");
    var rowLength = curDatarow + numOfData; //한 페이지에 마지막으로 출력해야할 row
    for (var j = curDatarow; j < rowLength; j++) {
        var data = dt[j];
        var valueTrId = $("#fixedTableLabel" + j);
        if(valueTrId.length < 1)
            tableId.append('<tr id = "fixedTableLabel' + j + '"></tr>');
        for (var key in data) {
            if (label.fieldName == key) {
                var valueTrId = $('#fixedTableLabel' + j);
                var key_data = data[key]._text;
                var table_reform = table_format_check(data, valueTrId, key_data, table);
                if(label.labelTextType == 'Number' && label.format != undefined){
                    valueTrId.append('<td class="' + key + ' Label ' + label._attributes + ' ' + label.dataType + ' ' + "MoneySosu" + '">' + table_reform + '</td>');
                }else{
                    valueTrId.append('<td class="' + key + ' Label ' + label._attributes + ' ' + label.dataType + '">' + table_reform + '</td>');
                }

                valueTrId.css({
                    'width': label.rectangle.width,
                    'height': label.rectangle.height
                });
                var td = $('.' + key);
                //// 추가 부분 18.08.28 YeSol
                if (label.noBorder == 'true') {
                    td.css('border', 'none');
                } else {
                    if (label.borderThickness !== undefined) {
                        var leftBorder = borderDottedLine(label.borderDottedLines.leftDashStyle);
                        var rightBorder = borderDottedLine(label.borderDottedLines.rightDashStyle);
                        var bottomBorder = borderDottedLine(label.borderDottedLines.bottomDashStyle);
                        var topBorder = borderDottedLine(label.borderDottedLines.topDashStyle);
                        td.css({
                            'border-left': label.borderThickness.left + 'px ' + leftBorder + ' ' + label.leftBorderColor,
                            'border-right': label.borderThickness.right + 'px ' + rightBorder + ' ' + label.rightBorderColor,
                            'border-bottom': label.borderThickness.bottom + 'px ' + bottomBorder + ' ' + label.bottomBorderColor,
                            'border-top': label.borderThickness.top + 'px ' + topBorder + ' ' + label.topBorderColor
                        });
                    } else {
                        td.css('border', '1px solid black');
                    }
                }
                td.css({
                    // 'border' : '1px solid black',
                    'font-size': label.fontSize,
                    'font-family': label.fontFamily,
                    'font-weight': label.fontStyle,
                    'background-color': label.backGroundColor,
                    'white-space': 'nowrap'
                });
            }
        }
    }
}

/**************************************************************************************
 기능 : GroupFieldArray가 있을 경우
 FixedTableValueLabel(고정 테이블 밸류 라벨)을 화면에 그려주는 함수를 만든다.
 만든이 : 하지연
 **************************************************************************************/
function drawingFixedTableValueLabelWithGroupFieldArray(label, dt, tableId, numOfData){
    for (var j = groupDataRow; j < numOfData; j++) {
        var data = groupFieldArray[groupFieldNum];
        var rowNum = curDatarow + j;
        // var $trId = '#fixedValueLabel' + rowNum;
        var $trId = '#fixedTableLabel' + rowNum;
        var valueTrId = $($trId);
        if (valueTrId.length < 1)
            // tableId.append('<tr id =   "fixedValueLabel' + rowNum + '"></tr>');
            //console.log("여기서 row 추가 => fixedTableLabel "+ rowNum );
          //  console.log("여기서 fixedTableNum : " +fixedTableNum + " fixedTableLabelNum " + fixedTableLabelNum + " rowNum : " + rowNum);
            //!!tr을 왜더함..;//tableId.append('<tr id =   "fixedTableLabel' + rowNum + '"></tr>');//여기서 생기는거임.. 조건걸어서 두번안생기게 해줘야하는데 어떤조건을 걸지 아직 모름.!!!얘 해줘야 두번째 테이블에도 row 생김
            //tableId.append('<tr id = "fixedTableLabel'+'_' + fixedTableNum +'_'+ fixedTableLabelNum + '"></tr>');
        for (var key in data[j]) {
            //console.log("!! 1");
            valueTrId = $($trId);
            // if (label.fieldName == key) {
            if (label.fieldName == undefined) {
                console.log("!! 2");
                var key_data = data[j][key]._text;
                var table_reform = table_format_check(data, valueTrId, key_data, label);

                if(label.labelTextType == 'Number' && label.format != undefined){//데이터형식이 숫자이고, 라벨의 형식이 정해져있다면. 머니소수클래스더함.
                    console.log("!! 3")
                    valueTrId.append(
                        '<td class="' + key + ' Label ' + label._attributes + ' ' + label.dataType + ' ' + "MoneySosu" + '">' + table_reform + '</td>'
                    );
                }else{
                    valueTrId.append(
                        '<td class="' + key + ' Label ' + label._attributes + ' ' + label.dataType + '">' + table_reform + '</td>'
                    );
                }
               /* valueTrId.css({ // tr css 주는거 같은데 안먹힘
                    'width': label.rectangle.width,
                    'height': label.rectangle.height,
                });*/
                var td = $('.' + key);
                if (label.noBorder == 'true') {
                    td.css('border', 'none');
                } else {
                    if (label.borderThickness !== undefined) {
                        //console.log("if문2 들어왔음");
                        var leftBorder = borderDottedLine(label.borderDottedLines.leftDashStyle);
                        var rightBorder = borderDottedLine(label.borderDottedLines.rightDashStyle);
                        var bottomBorder = borderDottedLine(label.borderDottedLines.bottomDashStyle);
                        var topBorder = borderDottedLine(label.borderDottedLines.topDashStyle);

                        td.css({
                            'border-left': label.borderThickness.left + 'px ' + leftBorder + ' ' + label.leftBorderColor,
                            'border-right': label.borderThickness.right + 'px ' + rightBorder + ' ' + label.rightBorderColor,
                            'border-bottom': label.borderThickness.bottom + 'px ' + bottomBorder + ' ' + label.bottomBorderColor,
                            'border-top': label.borderThickness.top + 'px ' + topBorder + ' ' + label.topBorderColor,
                            'border-collapse':'collapse'
                        });
                    } else {
                        td.css('border', '1px solid black');
                    }
                }
                td.css({
                    // 'border': '1px solid black',
                    'font-size': label.fontSize,
                    'font-family': label.fontFamily,
                    'font-weight': label.fontStyle,
                    'background-color': label.backGroundColor,
                    'white-space': 'nowrap'
                });
            }
        }
    }
}

/******************************************************************
 기능 : FixedTableValueLabel(고정 테이블 밸류 라벨)을 화면에 그려주는 함수를 만든다.
 만든이 : 하지연
 *******************************************************************/
function drawingFixedTableValueLabel(label, dt, tableId, numOfData, table) {
    if (groupFieldArray == undefined || groupFieldArray.length == 0) {
        drawingFixedTableValueLabelWithoutGroupFieldArray(label, dt, tableId, numOfData, table);
    } else {
        drawingFixedTableValueLabelWithGroupFieldArray(label, dt, tableId, numOfData);
    }
}

/******************************************************************
 기능 : FixedTableLabel(고정 테이블 라벨)을 화면에 그려주는 함수를 만든다.
 만든이 : 하지연
 *******************************************************************/
function drawingFixedTableLabel(label, dt, tableId, numOfData, table) {
    var temp = Object.keys(dt[0]);
    var titleTrId = $('#fixedTableLabel' + fixedTableLabelNum);
    var header_Name_Number = 1;
    temp.forEach(function (titleName) {
    });
    drawingFixedTableValueLabel(label, dt, tableId, numOfData, table);
        /*if (label.text == titleName) {
            console.log("1 + if들옴.");
            titleArray.push(titleName);
            titleTrId.append('<th id = "FixedTableLabel' + header_Name_Number + '_View_Page_Number' + thNum + '"></th>');
            titleTrId.css({
                'width': label.rectangle.width,
                'height': label.rectangle.height
            });
            var thId = $('#FixedTableLabel' + header_Name_Number + "_View_Page_Number" + thNum);

            //// 추가 부분 18.08.28 YeSol
            if (label.noBorder == 'true') {
                thId.css('border', 'none');
            } else {
                if (label.borderThickness !== undefined) {
                    var leftBorder = borderDottedLine(label.borderDottedLines.leftDashStyle);
                    var rightBorder = borderDottedLine(label.borderDottedLines.rightDashStyle);
                    var bottomBorder = borderDottedLine(label.borderDottedLines.bottomDashStyle);
                    var topBorder = borderDottedLine(label.borderDottedLines.topDashStyle);
                    thId.css({
                        'border-left': label.borderThickness.left + 'px ' + leftBorder + ' ' + label.leftBorderColor,
                        'border-right': label.borderThickness.right + 'px ' + rightBorder + ' ' + label.rightBorderColor,
                        'border-bottom': label.borderThickness.bottom + 'px ' + bottomBorder + ' ' + label.bottomBorderColor,
                        'border-top': label.borderThickness.top + 'px ' + topBorder + ' ' + label.topBorderColor
                    });
                } else {
                    thId.css('border', '1px solid red');
                }
            }

            thId.css({
                'background-color': label.backGroundColor,
                'font-size': label.fontSize,
                'font-family': label.fontFamily,
                'font-weight': label.fontStyle,
                'font-color': label.textColor
            });
            thId.append(titleName);
            thId.addClass('Label FixedTableHeader');
            thId.addClass(label._attributes);
            table_column_controller(thId, titleTrId);
        }
        header_Name_Number++;*/
        //console.log("할일 끝?");

}

/******************************************************************
 기능 : SystemLabel(시스템 라벨)을 화면에 그려주는 함수를 만든다.
 만든이 : 안예솔

 수정 : Label에 'Label', 각자의 DataType 클래스 추가
 Date : 2018-08-24
 From 전형준

 수정 : 라벨의 크기 조정, 위치 이동, 내용 수정 추가.
 Date : 2018-08-27
 From hagdung-i
 ******************************************************************/
function drawingSystemLabel(data, divId, band_name) {
    var labelNbandInfo = {
        data: data,
        divId: divId,
        band_name: band_name !== undefined ? band_name : undefined,
        div: $('#' + divId),
        labelId: $('#' + data.dataType + systemLabelNum++),
        label_scope: "NormalLabel_scope",
        labelNum: systemLabelNum,
        label_type: data.dataType
    }
    labelPropertyApply(labelNbandInfo);
}


/******************************************************************
 기능 : SummaryLabel(요약 라벨)을 화면에 그려주는 함수를 만든다.
 만든이 : 안예솔

 수정 : Label에 'Label', 각자의 DataType 클래스 추가
 Date : 2018-08-24
 From 전형준

 수정 : SummaryLabel의 크기 조정, 위치 이동, 내용 수정 추가.
 Date : 2018-08-27
 From hagdung-i
 ******************************************************************/
function drawingSummaryLabel(data, divId, band_name) {
    var labelNbandInfo = {
        data: data,
        divId: divId,
        band_name: band_name !== undefined ? band_name : undefined,
        div: $('#' + divId),
        labelId: $('#' + data.dataType + summaryLabelNum++),
        label_scope: "NormalLabel_scope",
        labelNum: summaryLabelNum,
        label_type: data.dataType
    }
    labelPropertyApply(labelNbandInfo);
}

/******************************************************************
 기능 : DataLabel(데이터 라벨)을 화면에 그려주는 함수를 만든다.
 만든이 : 안예솔

 수정 : Label에 'Label', 각자의 DataType 클래스 추가
 Date : 2018-08-24
 From 전형준

 수정 : DataLabel의 크기 조정, 위치 이동, 내용 수정 추가.
 Date : 2018-08-27
 From hagdung-i

 수정 : DataLabel의 크기 조정, 위치 이동이 lock 속성이 있을 경우 수정 불가한 로직 추가.
 Date : 2018-08-28
 From hagdung-i
 ******************************************************************/
function drawingDataLabel(data, divId, band_name) {
    var labelNbandInfo = {
        data: data,
        divId: divId,
        band_name: band_name !== undefined ? band_name : undefined,
        div: $('#' + divId),
        labelId: $('#' + data.dataType + dataLabelNum++),
        label_scope: "NormalLabel_scope",
        labelNum: dataLabelNum,
        label_type: data.dataType
    }
    labelPropertyApply(labelNbandInfo);
}

/******************************************************************
 기능 : NormalLabel(일반 라벨)을 화면에 그려주는 함수를 만든다.
 만든이 : 안예솔

 수정 : Label에 'Label', 각자의 DataType 클래스 추가
 Date : 2018-08-24
 From 전형준

 수정 : NormalLabel의 크기 조정, 위치 이동, 내용 수정 추가.
 Date : 2018-08-27
 From hagdung-i

 수정 : 크기 조정, 위치 이동, 내용 수정 추가 기능 함수화 및 p 태그 내부 데이터 넣는 방식 변경.
 Date : 2018-08-28
 From hagdung-i
 ******************************************************************/
function drawingNormalLabel(data, divId, band_name) {
    var labelNbandInfo = {
        data: data,
        divId: divId,
        band_name: band_name !== undefined ? band_name : undefined,
        div: $('#' + divId),
        labelId: $('#' + data.dataType + normalLabelNum++),
        label_scope: "NormalLabel_scope",
        labelNum: normalLabelNum,
        label_type: data.dataType
    }
    labelPropertyApply(labelNbandInfo);
}

/******************************************************************
 기능 : Expression(수식 라벨)을 화면에 그려주는 함수를 만든다.
 만든이 : 안예솔

 수정 : Label에 'Label', 각자의 DataType 클래스 추가
 Date : 2018-08-24
 From 전형준

 수정 : 수식 라벨의 크기 조정, 위치 이동, 내용 수정 추가.
 Date : 2018-08-27
 From hagdung-i
 ******************************************************************/
function drawingExpression(data, divId, band_name) {
    var labelNbandInfo = {
        data: data,
        divId: divId,
        band_name: band_name !== undefined ? band_name : undefined,
        div: $('#' + divId),
        labelId: $('#' + data.dataType + expressionNum++),
        label_scope: "NormalLabel_scope",
        labelNum: expressionNum,
        label_type: data.dataType
    }
    labelPropertyApply(labelNbandInfo);
}

/******************************************************************
 테이블의 TitleLabel 에서만 그룹핑을 할 수 있음
 ******************************************************************/
/******************************************************************
 기능 : GroupLabel(그룹 라벨)을 화면에 그려주는 함수를 만든다.
 만든이 : 안예솔

 수정 : GroupLabel의 크기 조정, 위치 이동, 내용 수정 추가.
 Date : 2018-08-27
 From hagdung-i
 ******************************************************************/
function drawingGroupLabel(data, divId, band_name) {
    var labelNbandInfo = {
        data: data,
        divId: divId,
        band_name: band_name !== undefined ? band_name : undefined,
        div: $('#' + divId),
        labelId: $('#' + data.dataType + groupLabelNum++),
        label_scope: "NormalLabel_scope",
        labelNum: groupLabelNum,
        label_type: data.dataType
    }
    labelPropertyApply(labelNbandInfo);
}

/******************************************************************
 기능 : ParameterLabel(파라미터 라벨)을 화면에 그려주는 함수를 만든다.
 만든이 : 안예솔

 수정 : ParameterLabel의 크기 조정, 위치 이동, 내용 수정 추가.
 Date : 2018-08-27
 From hagdung-i
 ******************************************************************/
function drawingParameterLabel(data, divId, band_name) {
    var labelNbandInfo = {
        data: data,
        divId: divId,
        band_name: band_name !== undefined ? band_name : undefined,
        div: $('#' + divId),
        labelId: $('#ParameterLabel' + parameterLabelNum++),
        label_scope: "NormalLabel_scope",
        labelNum: parameterLabelNum,
        label_type: data.dataType
    }
    labelPropertyApply(labelNbandInfo);
}

/******************************************************************
 기능 : 시간 또는 날짜를 출력할 때 한 자리 숫자일 경우 0을 붙여줘서 두 자리 숫자로 출력 해주는 함수를 만든다.
 만든이 : 안예솔
 ******************************************************************/
function plusZero(data) {
    var str = data.toString();
    if (str.length == 1) {
        data = '0' + data;
    }
    return data;
}

/******************************************************************
 기능 : 한 글자씩 출력하는 함수를 만든다.
 만든이 : 안예솔
 ******************************************************************/
function toStringFn(text, pTagId) {
    var tag = $('#' + pTagId);
    var str = text.toString();
    var appendStr = str[0];
    for (var i = 1; i < str.length; i++) {
        appendStr += str[i];
    }
    tag.append(appendStr);
}

/******************************************************************
 기능 : 가운데 정렬 함수를 만든다.
 만든이 : 안예솔
 ******************************************************************/
function textAlignCenter(text, pTagId, wordWrap, textDirection) {
    var tag = $('#' + pTagId);
    var fontSize = (tag.css('font-size')).split('px');
    if (wordWrap == false && textDirection == 'Horizontal') {
        var parentWidth = (tag.parent().css('width')).split('px');
        var str = text.toString();
        var temp = str.split('<br/>');

        var space = temp[0].match(/\s/gi); // 공백 찾기
        var eng = temp[0].match(/[a-z]/gi); // 영문 찾기

        var max = temp[0].length; // 한 줄에 있는 텍스트 길이 중 제일 긴 길이를 넣을 변수
        var maxExceptSpace; // 길이가 제일 긴 텍스트에서 공백을 제외한 길이를 넣을 변수
        if (space != null) {
            maxExceptSpace = max - space.length;
        }
        if (eng != null) {
            maxExceptSpace = maxExceptSpace - eng.length * 0.5;
        }
        if (temp.length > 1) {
            for (var i = 1; i < temp.length; i++) {
                temp[i] = temp[i].trim();
                space = temp[i].match(/\s/gi); // 공백 찾기
                eng = temp[i].match(/[a-z]/gi); // 영문 찾기
                if (temp[i].length > max) {
                    if (space != null) {
                        max = temp[i].length;
                        maxExceptSpace = max - space.length;
                    } else {
                        max = temp[i].length;
                        maxExceptSpace = max;
                    }
                    if (eng != null) {
                        maxExceptSpace = maxExceptSpace - eng.length * (0.5);
                    }
                }
            }
        }

        maxExceptSpace = parseInt(maxExceptSpace);

        fontSize[0] = parseInt(fontSize[0]);
        parentWidth[0] = parseInt(parentWidth[0]);

        if (maxExceptSpace * fontSize[0] > parentWidth[0]) {
            var spacing = (parentWidth[0] - fontSize[0] * maxExceptSpace) / 2;

            tag.css({
                'left': spacing + 'px',
                'right': spacing + 'px',
                'position': 'absolute',
                'overflow': 'visible',
                'white-space': 'nowrap',
                'text-align': 'center'
            });
        } else {
            tag.css('text-align', 'center');
        }
    } else if (textDirection == 'Vertical') {
        var children = tag.children().text().length;
        var parentHeight = (tag.css('height')).split('p');
        var margin = (parentHeight[0] - children * fontSize[0]) / 2;
        tag.children().css({
            'margin-top': margin + 'px',
            'margin-bottom': margin + 'px'
        });
    } else {
        tag.css('text-align', 'center');
    }
}

//////////////// 왠지 야매로 만든 느낌
/******************************************************************
 기능 : 폰트 크기가 자동으로 줄어드는 함수를 만든다.
 만든이 : 안예솔
 ******************************************************************/
function fontSizeAutoSmall(text, pTagId) {
    var tag = $('#' + pTagId);
    var parentWidth = (tag.parent().css('width')).split('p');
    var fontSize = (tag.css('font-size')).split('p');
    var str = text.toString();
    var temp = str.split('<br/>');

    var space = temp[0].match(/\s/gi);

    var max = temp[0].length;

    if (temp.length > 1) {
        for (var i = 1; i < temp.length; i++) {
            temp[i] = temp[i].trim();
            space = temp[i].match(/\s/gi); // 공백 찾기
            if (temp[i].length > max) {
                max = temp[i].length;
            }
        }
    }
    if ((max * fontSize[0]) > parentWidth[0]) {
        var smallFontSize = 0;
        if (space != null) {
            max = max - space.length;
            smallFontSize = Math.floor(parentWidth[0] / (max + space.length * 0.5) * 1.333);
        } else {
            smallFontSize = Math.floor(parentWidth[0] / max * 1.333); // 왜 1.333을 곱해주는거지..?
        }
        tag.css('font-size', smallFontSize + 'pt');
    }
}

/******************************************************************
 기능 : 텍스트 방향이 수직인 함수를 만든다.
 만든이 : 안예솔
 ******************************************************************/
function textAlignVertical(text, pTagId) {
    var pTag = $('#' + pTagId);
    var parentHeight = pTag.parent().css('height').split('p');
    var parentWidth = pTag.parent().css('width').split('p');
    pTag.css({
        'width': parentWidth[0] + 'px',
        'height': parentHeight[0] + 'px'
    });

    var str = text.toString();
    var strSplitByBr = str.split('<br/>');
    var fontSize = (pTag.css('font-size')).split('p');
    strSplitByBr.forEach(function (data, j) {
        data = data.trim();
        var appendStr = data[0];
        for (var i = 1; i < data.length; i++) {
            if (data[i] == ' ') {
                appendStr += '<br/>';
            } else {
                appendStr += data[i];
            }
        }

        var sonHeight = fontSize[0] * data.length;

        var sonTop = (parentHeight[0] - sonHeight) / 2;
        var style = 'white-space : normal; float : left; height : ' + parentHeight[0] + 'px; width : ' + fontSize[0] + 'px;/* margin-top : ' + sonTop + 'px; margin-bottom : ' + sonTop + 'px;*/ line-height : ' + fontSize[0] + 'px;';

        pTag.append('<p style = "' + style + '">' + appendStr + '</p>');
    });
    var marginLeft = (parentWidth[0] - strSplitByBr.length * fontSize[0]) / 2;
    pTag.css({
        'width': (strSplitByBr.length * fontSize[0]) + 'px',
        'height': parentHeight[0] + 'px',
        'margin-left': marginLeft + 'px'
    });
}

/******************************************************************
 기능 : 텍스트 수평 정렬이 균등분할인 속성을 구현한다.
 만든이 : 안예솔
 ******************************************************************/
function textEqualDivision(text, pTagId) {
    var tag = $('#' + pTagId);
    var str = text.toString();
    var fontSize = (tag.css('font-size')).split('p');
    var parentWidth = tag.css('width').split('p');
    var temp = str.split('<br/>');

    for (var i = 0; i < temp.length; i++) {
        temp[i] = temp[i].trim();
        var space = temp[i].match(/\s/gi);
        var num = 0;
        if (space != null) {
            num = temp[i].length - space.length;
        } else {
            num = temp[i].length
        }
        temp[i] = temp[i].replace(/\s/gi, '');
        var spacing = (parentWidth[0] - fontSize[0] * num) / (num - 1);
        tag.append('<p style = "letter-spacing : ' + spacing + 'px; margin:0px;">' + temp[i] + '</p>');
    }
}

/******************************************************************
 기능 : 텍스트 수직 정렬이 가운데인 속성을 구현한다.
 만든이 : 안예솔
 ******************************************************************/
function verticalCenter(pTagId) {
    var tag = $('#' + pTagId);
    var height = (tag.css('height')).split('p');

    var parentHeightString = tag.parent().css('height');
    var parentHeight = parentHeightString.split('p');

    if (parseInt(height[0]) >= parseInt(parentHeight[0])) {
        tag.css({
            'margin-top': '0px',
            'margin-bottom': '0px'
        });
    } else {
        var mid = (parentHeight[0] - height[0]) / 2;

        tag.css({
            'margin-top': mid + 'px',
            'margin-bottom': mid + 'px'
        });
    }
}

/******************************************************************
 기능 : 텍스트 수직 정렬이 위쪽인 속성을 구현한다.
 만든이 : 안예솔
 ******************************************************************/
function verticalTop(pTagId) {
    var tag = $('#' + pTagId);

    tag.css({
        'margin-top': '0px'
    });
}

/******************************************************************
 기능 : 텍스트 수직 정렬이 아래쪽인 속성을 구현한다.
 만든이 : 안예솔
 ******************************************************************/
function verticalBottom(pTagId) {
    var tag = $('#' + pTagId);
    var height = (tag.css('height')).split('p');

    var parentHeightString = tag.parent().css('height');
    var parentHeight = parentHeightString.split('p');

    var spacing = parentHeight[0] - height[0];

    tag.css({
        'margin-top': spacing + 'px',
        'margin-bottom': '0px'
    });
}

/******************************************************************
 기능 : 텍스트 수직 정렬이 균등분할인 속성을 구현한다.
 만든이 : 안예솔
 ******************************************************************/
function verticalCenterEqualDivision(text, pTagId, textDirection) {
    var tag = $('#' + pTagId);
    tag.css({
        'margin-top': '0px',
        'margin-bottom': '0px',
    });
    if (textDirection == 'Horizontal') { // 글자가 가로 방향일 때
        var fontSize = (tag.css('font-size')).split('p');
        // 16pt 이런 식으로 값이 받아져서 p앞으로 끊어서 숫자만 받아오려고 한 문자열 자르기 작업
        var brTag = $('#' + pTagId + ' br');
        var brCount = brTag.length;
        // text중에서 <br/>의 개수를 구함

        var parentHeightString = tag.parent().css('height');
        var parentHeight = parentHeightString.split('p');

        if (brCount == 0) {
            var mid = (parentHeight[0] - fontSize[0] * (brCount + 1)) / 2 - brCount;
            tag.css({
                'margin-top': mid + 'px',
                'margin-bottom': mid + 'px'
            });
        } else {
            var spacing = (parentHeight[0] - fontSize[0] * (brCount + 1)) / brCount - brCount;
            brTag.before('<p style = "height : ' + spacing + 'px; margin-top : 0px; margin-bottom : 0px;"></p>'); // <br/>이 나오기 전에 p태그를 삽입한 후 remove()로 삭제 (줄 바꿈을 위함)
            brTag.remove();
        }
    } else { // 글자가 세로 방향일 때
        tag.text('');
        var str = text.toString();
        var fontSize = (tag.css('font-size')).split('p');
        // // 16pt 이런 식으로 값이 받아져서 p앞으로 끊어서 숫자만 받아오려고 한 문자열 자르기 작업
        var parentHeight = (tag.css('height')).split('p');
        var temp = str.split('<br/>'); // <br/>태그를 중심으로 자름
        for (var i = 0; i < temp.length; i++) {
            temp[i] = temp[i].trim(); // 공백 제거
            var spacing = Math.ceil((parentHeight[0] - temp[i].length * fontSize[0]) / (temp[i].length - 1)) + 1; //
            var appendStr = temp[i][0];
            appendStr += '<p style = "height : ' + spacing + 'px; width: ' + fontSize[0] + 'px; margin-top : 0px; margin-bottom : 0px;"></p>';
            for (var j = 1; j < temp[i].length; j++) {
                if (j == (temp[i].length - 1)) {
                    appendStr += temp[i][j];
                    // appendStr += '<p style = "height : 22.669px; margin-top : 0px; margin-bottom : 0px"></p>';
                } else {
                    appendStr += temp[i][j];
                    appendStr += '<p style = "height : ' + Math.ceil(spacing) + 'px; width : ' + fontSize[0] + 'px; margin-top : 0px; margin-bottom : 0px;"></p>';
                }
            }
            tag.css({
                'margin-top': '0px',
                'margin-bottom': '0px'
            });
            tag.append('<p id = "vertical' + verticalPNum + '" style = width:' + fontSize[0] + 'px; height : ' + parentHeight[0] + 'px; margin-top:0px; margin-bottom:0px"></p>');
            var verticalPId = $('#vertical' + verticalPNum);
            verticalPId.css({
                'float': 'left',
                'margin-top': '0px',
                'margin-bottom': '0px'
            });
            verticalPId.append(appendStr);
            verticalPNum++;
        }
    }
}

/******************************************************************
 기능 : 자동 높이 조정 속성이 '예'일 경우를 구현한다.
 만든이 : 안예솔
 ******************************************************************/
function autoSizeTrue(pTagId) {
    var tag = $('#' + pTagId);
    var fontSize = (tag.css('font-size')).split('p');
    // 16pt 이런 식으로 값이 받아져서 p앞으로 끊어서 숫자만 받아오려고 한 문자열 자르기 작업

    var brTag = $('#' + pTagId + ' br');
    var brCount = brTag.length;
    // text중에서 <br/>의 개수를 구함

    var height = fontSize[0] * (brCount + 1) + brCount;
    tag.parent().css({
        'height': height,
        'top': height + fontSize[0] + 'px'
    });
    tag.css({
        'margin-top': '0px',
        'margin-bottom': '0px'
    });
}

/******************************************************************
 기능 : 줄 간격 속성을 구현한다.
 만든이 : 안예솔
 ******************************************************************/
function lineSpacing(text, spacing, pTagId) {
    var tag = $('#' + pTagId);
    tag.css({
        'margin-top': '0px',
        'margin-bottom': '0px',
    });

    var brTag = $('#' + pTagId + ' br');
    var brCount = brTag.length;
    // text중에서 <br/>의 개수를 구함

    var parentHeightString = tag.parent().css('height');
    var parentHeight = parentHeightString.split('p');
    var fontSize = (tag.css('font-size')).split('p');

    var mid = (parentHeight[0] - (fontSize[0] * (brCount + 1) + spacing * brCount)) / 2 - brCount;

    if (brCount == 0) {
        verticalCenter(pTagId);
    } else {
        tag.css({
            'margin-top': mid + 'px',
            'margin-bottom': mid + 'px'
        });
        brTag.before('<p style = "height : ' + spacing + 'px; margin-top : 0px; margin-bottom : 0px;"></p>'); // <br/>이 나오기 전에 p태그를 삽입한 후 remove()로 삭제 (줄 바꿈을 위함)
        brTag.remove();
    }
}

/******************************************************************
 기능 : 각각의 형태의 Label id와 데이터를 받아서 lock이 걸려있는 라벨을 제외한 라벨들의 위치 이동, 크기 조정 기능 추가.
 Date : 2018-08-24
 만든이 : hagdung-i
 ******************************************************************/
function Lock_check(data, Label_id, div) { //라벨 데이터, 드래그 리사이즈 영역, 벗어나면 안되는 영역
    var Lock_check;
    var editable_test = data.editable;
    editable_test = 'true';
    if (editable_test == 'true') {
        if (data.Lock === undefined) {
            Lock_check = data.Lock;
        } else {
            Lock_check = data.Lock._text;
        }
        if (!Lock_check) {
            Label_id.draggable({containment: "#" + div[0].id, zIndex: 999});
            Label_id.resizable({containment: "#" + div[0].id, autoHide: true});
        }
    }
}

/******************************************************************
 기능 : 각각의 형태의 테이블의 id와 데이터를 받아서 lock이 걸려있는 라벨을 제외한 라벨들의 위치 이동, 크기 조정 기능 추가.
 Date : 2018-08-24
 만든이 : hagdung-i
 ******************************************************************/
function Lock_Check_Table(data, drag, resize, div) { //테이블 데이터, 드래거블 지정할 영역, 리사이즈 영역, 위치 이동시 벗어나면 안되는 영역
    var Lock_check;
    if (data.Lock === undefined) {
        Lock_check = data.Lock;
    } else {
        Lock_check = data.Lock._text;
    }
    if (!Lock_check) {
        drag.draggable({containment: "#" + div[0].id, zIndex: 999});
        resize.resizable({
            containment: "#" + div[0].id, autoHide: true,
            resize: function (event, ui) {   //테이블사이즈는 가로만 조정 가능하도록.
                ui.size.height = ui.originalSize.height;
            }
        });
    }
}

/******************************************************************
 기능 : 라벨 데이터 포맷을 확인해서 소수점 자릿수 설정 값에 따라 해당 형태로 변경 로직 추가.
 Date : 2018-08-24
 만든이 : hagdung-i
 ******************************************************************/
function format_check(data) {
    var test = data.formatType;
    var num_check = data.text.replace(/[^0-9]/g, ""); //데이터에서 숫자만 추출.
    var data_text = data.text;
    if (test == "AmountSosu") {   //추후, 다른 7가지의 속성을 알게되면 else if로 추가해야함.
        if (num_check != "") { //해당 데이터가 숫자인 경우내려
            data_text = num_check.replace(/\B(?=(\d{3})+(?!\d))/g, ","); //천단위로 콤마를 찍어줌.
        }
        return data_text;
    } else {
        return data_text;
    }
}

/******************************************************************
 기능 : 테이블 안의 데이터 포맷을 확인해서 소수점 자릿수 설정 값에 따라 해당 형태로 변경 로직 추가.
 Date : 2018-08-24
 만든이 : hagdung-i
 ******************************************************************/
function table_format_check(data, Label_id, key, table) {
    var test = table.formatType;
    var data_text;
    if (key != NaN) { //해당 데이터가 숫자일 경우
        if (test === "AmountSosu" || test === "MoneySosu" || test === "MoneySosu") {   //수량, 금액 소숫점 자리수 ###,###
            var parts = key.toString().split(".");
            if (parts[1]) {
                var decimal_cutting = parts[1].substring(0, 2);
                console.log("decimal_cutting : ", decimal_cutting);
                return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "." + decimal_cutting;
            }
            // data_text = key.replace(/\B(?=(\d{3})+(?!\d))/g, ","); //천단위로 콤마를 찍어줌.
            // return data_text;
        } else if (test === "WonHwaDangaSosu" || test === "ExchangeSosu" || test === "ExchangeRateSosu") {   //원화단가, 외화 소수점 자리수 ###,###.00
            var parts = key.toString().split(".");
            if (parts[1]) {
                var decimal_cutting = parts[1].substring(0, 2);
                console.log("decimal_cutting : ", decimal_cutting);
                return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
            }
        } else if (test === "ExchangeDangaSosu" || test === "BiyulSosu" || test === "ExchangeAmountSosu") { //외화단가, 비율 소수점 자리수 ###,###.000
            var parts = key.toString().split(".");
            if (parts[1]) {
                var decimal_cutting = parts[1].substring(0, 3);
                console.log("decimal_cutting : ", decimal_cutting);
                return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
            }
        } else {
            return key;
        }
    }
    return key;
}

/******************************************************************
 기능 : 테이블 항목별 크기조정 기능
 Date : 2018-08-30
 만든이 : hagdung-i
 ******************************************************************/
function table_column_controller(resize_area, Unalterable_area) {
    resize_area.resizable({
        containment: "#" + Unalterable_area[0].id, autoHide: true,
        resize: function (event, ui) {   //테이블사이즈는 가로만 조정 가능하도록.
            ui.size.height = ui.originalSize.height;
        }
    });
}

/******************************************************************
 기능 : 이미지 라벨 추가.
 Date : 2018-09-12
 만든이 : hagdung-i
 ******************************************************************/
function image_label_making(labelNbandInfo) {
    var image_str = labelNbandInfo.data.base64ImageFromViewer;
    var file_name = labelNbandInfo.data.text;
    var div_id = labelNbandInfo.labelId[0].id;
    var test2 = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath d='M224%20387.814V512L32 320l192-192v126.912C447.375 260.152 437.794 103.016 380.93 0 521.287 151.707 491.48 394.785 224 387.814z'/%3E%3C/svg%3E";
    var baseMaking = "data:image/svg;base64," + image_str.trim(); //base64 -> html 포맷으로 변경.
    var test3 = "data:image/svg;base64," + test2;
    var image_send = document.createElement("img");
    image_send.id = "DRD_image" + div_id.replace(/[^0-9]/g, '');
    image_send.className = "image";
    image_send.style.width = "100%";
    image_send.style.height = "100%";
    image_send.style.color = "rgba(255, 151, 166, 0.5)";
    image_send.src = baseMaking;
    var image_div = document.getElementById(div_id); //추후 변경해야됨 해당 div의 id로
    image_div.appendChild(image_send);

    Transparent_Cloak(labelNbandInfo.data.imageTransparent, image_send);

}

/******************************************************************
 기능 : 이미지 투명도, 이미지 크기에 따른 이미지 조정 기능
 Date : 2018-09-11
 만든이 : hagdung-i
 ******************************************************************/
function Transparent_Cloak(imageTransparent, image) {
    if (imageTransparent.IsUseTransParent) { //투명도 관련 속성이 존재할 경우
        var TransparentOX = imageTransparent.IsUseTransParent._text;
        if (TransparentOX) {  //투명도 여부를 확인
            var TransparentColor = imageTransparent.TransParentColor._text;
            // image_id.css({'filter':'chroma(color=#FF97A6)'});
            //#fb99a6
            return TransparentColor;
        }
    }
}

/******************************************************************
 기능 : 라벨의 p태그 생성 및 각 가벨의 특성에 맞춰 커스텀하는 로직을 따로 추출.
 사유 : 이미지 같이 p태그가 들어가지 않는 라벨 작업을 위함.
 Date : 2018-09-12
 만든이 : hagdung-i
 ******************************************************************/
function label_text_Setting(labelNbandInfo) {

    labelNbandInfo.labelId.append('<p id = "P' + labelNbandInfo.label_type + labelNbandInfo.labelNum + '"></p>');
    Lock_check(labelNbandInfo.data, labelNbandInfo.labelId, labelNbandInfo.div);

    var pId = $('#P' + labelNbandInfo.label_type + labelNbandInfo.labelNum);


    if (labelNbandInfo.label_type === "SystemLabel") {
        var date = new Date();
        switch (labelNbandInfo.data.systemFieldName) {
            case 'Date' :
                var year = date.getFullYear();
                var month = plusZero(date.getMonth() + 1); // month는 0부터 시작
                var day = plusZero(date.getDate());
                labelNbandInfo.data.text = year + '-' + month + '-' + day;
                pId.addClass("date");
                break;
            case 'Date/time' :
                var year = date.getFullYear();
                var month = plusZero(date.getMonth() + 1); // month는 0부터 시작
                var day = plusZero(date.getDate());
                var hour = plusZero(date.getHours());
                var min = plusZero(date.getMinutes());
                var sec = plusZero(date.getSeconds());
                labelNbandInfo.data.text = year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec;
                pId.addClass("dateTime");
                break;
            case 'Time' :
                var hour = plusZero(date.getHours());
                var min = plusZero(date.getMinutes());
                var sec = plusZero(date.getSeconds());
                labelNbandInfo.data.text = hour + ':' + min + ':' + sec;
                pId.addClass("time");
                break;
            case 'PageNumber' : // 현재 페이지 번호
                pId.addClass("pageNumber");
                labelNbandInfo.data.text = "tempStr";
                break;
            case 'TotalPage' : // 전체 페이지 번호
                pId.addClass("totalPage");
                labelNbandInfo.data.text = "tempStr";
                break;
            case 'PageNumber / TotalPage' :  // 현재 페이지 번호 / 전체 페이지 정보
                pId.addClass("pageNumberTotalPage");
                labelNbandInfo.data.text = "tempStr";
                break;
        }
    }

    // 요약라벨
    if (labelNbandInfo.label_type === "SummaryLabel") {
        var dt = Object.values(dataTable.DataSetName)[0];
        var key_arr = Object.keys(dt[0]);

        var key = null;
        key_arr.forEach(function (obj) { // key 값 설정
            if (labelNbandInfo.data.fieldName == obj) {
                key = obj;
                return;
            }
        });

        switch (labelNbandInfo.data.summaryType) {
            case 'Sum' :    // 합계
                var summary_label_sum = 0;

                if (groupFieldArray.length !== 0) { // 그룹 기준 필드가 있을 때
                    for (var i = 0; i < groupFieldArray[groupFieldNum - 1].length - 1; i++) {
                        summary_label_sum += Number(groupFieldArray[groupFieldNum - 1][i + 1][key]._text);
                    }
                } else {
                    for (var i = 0; i < dt.length; i++) {
                        summary_label_sum += Number(dt[i][key]._text);
                    }
                }

                labelNbandInfo.data.text = summary_label_sum;
                if (isNaN(Number(labelNbandInfo.data.text))) {
                    labelNbandInfo.data.text = "오류!";
                    pId.attr('title', '값이 숫자가 아닙니다');
                }
                break;
            case 'Avg' :    // 평균
                var summary_label_sum = 0;
                var summary_label_avg = 0;

                if (groupFieldArray.length !== 0) { // 그룹 기준 필드가 있을 때
                    for (var i = 0; i < groupFieldArray[groupFieldNum - 1].length - 1; i++) {
                        summary_label_sum += Number(groupFieldArray[groupFieldNum - 1][i + 1][key]._text);
                    }
                    summary_label_avg = summary_label_sum / (groupFieldArray[groupFieldNum - 1].length - 1);
                } else {
                    for (var i = 0; i < dt.length; i++) {
                        summary_label_sum += Number(dt[i][key]._text);
                    }
                    summary_label_avg = summary_label_sum / dt.length;
                }
                labelNbandInfo.data.text = summary_label_avg;
                if (isNaN(Number(labelNbandInfo.data.text))) {
                    labelNbandInfo.data.text = "오류!";
                    pId.attr('title', '값이 숫자가 아닙니다');
                }
                break;
            case 'Max' :    // 최대값
                var temp_arr = [];
                if (groupFieldArray.length !== 0) { // 그룹 기준 필드가 있을 때
                    for (var i = 0; i < groupFieldArray[groupFieldNum - 1].length - 1; i++) {
                        temp_arr.push(Number(groupFieldArray[groupFieldNum - 1][i + 1][key]._text));
                    }
                    var summary_label_max = temp_arr.reduce(function (previous, current) {
                        return previous > current ? previous : current;
                    });
                } else {
                    for (var i = 0; i < dt.length; i++) {
                        temp_arr.push(Number(dt[i][key]));
                    }
                    var summary_label_max = temp_arr.reduce(function (previous, current) {
                        return previous > current ? previous : current;
                    });
                }
                if (isNaN(Number(labelNbandInfo.data.text))) {
                    labelNbandInfo.data.text = "오류!";
                    pId.attr('title', '값이 숫자가 아닙니다');
                }
                labelNbandInfo.data.text = summary_label_max;
                break;
            case 'Min' :    // 최소값
                var temp_arr = [];
                if (groupFieldArray.length !== 0) { // 그룹 기준 필드가 있을 때
                    for (var i = 0; i < groupFieldArray[groupFieldNum - 1].length - 1; i++) {
                        temp_arr.push(Number(groupFieldArray[groupFieldNum - 1][i + 1][key]._text));
                    }
                    var summary_label_min = temp_arr.reduce(function (previous, current) {
                        return previous > current ? current : previous;
                    });
                } else {
                    for (var i = 0; i < dt.length; i++) {
                        temp_arr.push(Number(dt[i][key]));
                    }
                    var summary_label_min = temp_arr.reduce(function (previous, current) {
                        return previous > current ? current : previous;
                    });
                }
                labelNbandInfo.data.text = summary_label_min;
                if (isNaN(Number(labelNbandInfo.data.text))) {
                    labelNbandInfo.data.text = "오류!";
                    pId.attr('title', '값이 숫자가 아닙니다');
                }
                break;
            case 'Cnt' :    // 개수
                var summary_label_cnt = 0;
                if (groupFieldArray.length !== 0) { // 그룹 기준 필드가 있을 때
                    summary_label_cnt = groupFieldArray[groupFieldNum - 1].length - 1;
                } else {
                    summary_label_cnt = dt.length;
                }

                labelNbandInfo.data.text = summary_label_cnt;
                if (isNaN(Number(labelNbandInfo.data.text))) {
                    labelNbandInfo.data.text = "오류!";
                    pId.attr('title', '값이 숫자가 아닙니다');
                }
                break;
            default :   // None
                labelNbandInfo.data.text = '';
                break;
        }
    }

    // fontSize의 단위를 통일하기위해
    var fontSizePt = changeFontUnit(labelNbandInfo.data.fontSize);
    // console.log("pId : ",pId[0].clientWidth);
    pId.css({
        'font-size': fontSizePt,
        'font-family': labelNbandInfo.data.fontFamily,
        'font-weight': labelNbandInfo.data.fontWeight,
        'font-style': labelNbandInfo.data.fontStyle,
        'margin-top': '10px',
        'margin-bottom': '10px',
        'margin-right': '10px',
        'margin-left': '10px'
    });

    // 금액 표시 방법 한글
    // if (data.numberToTextType == 'KOR') {
    //     var KOR = numberToKOR((data.text).replace(/[^0-9]/g, ""));
    //     var tempKOR = (data.text).match(/[0-9]/gi);
    //     var toStringKOR = tempKOR[0];
    //     for (var i = 1; i < tempKOR.length; i++) {
    //         toStringKOR += tempKOR[i];
    //     }
    //     toStringKOR = toStringKOR.toString();
    // }
    //
    // // 금액 표시 방법 한자
    // if (data.numberToTextType == 'CHN') {
    //     var CHN = numberToCHN((data.text).replace(/[^0-9]/g, ""));
    // }

    if (labelNbandInfo.label_type === "ParameterLabel") {
        paramTable.NewDataSet.Table1.forEach(function (paramData) {
            if (labelNbandInfo.data.parameterName == paramData.Key._text) {
                labelNbandInfo.data.text = paramData.Value._text;
            }
        });
    }

    if (labelNbandInfo.label_type === "DataLabel") {
        if (groupFieldArray !== undefined) {
            pId.append(groupFieldArray[groupFieldNum][0]);
            labelNbandInfo.data.text = pId.text();
        }
    }

    // 0값 표시 여부가 NoShow(표시하지 않음) 이고 문자 형식이 숫자 일 때
    if (labelNbandInfo.data.showZeroState == 'NoShow' && labelNbandInfo.data.labelTextType == 'Number') {
        labelNbandInfo.data.text = (labelNbandInfo.data.text).replace(/(^0+)/, '');
    }

    if (labelNbandInfo.data.text !== undefined) {
        pId.text('');
        if (labelNbandInfo.data.textDirection == 'Vertical') {
            textAlignVertical(labelNbandInfo.data.text, "P" + labelNbandInfo.label_type + labelNbandInfo.labelNum);
        } else if (labelNbandInfo.data.textDirection == 'Horizontal') {
            toStringFn(labelNbandInfo.data.text, "P" + labelNbandInfo.label_type + labelNbandInfo.labelNum);
        }
    }

    // 자간 속성
    if (labelNbandInfo.data.characterSpacing !== undefined) {
        characterSpacing(labelNbandInfo.data.text, labelNbandInfo.data.characterSpacing,
            "P" + labelNbandInfo.label_type + labelNbandInfo.labelNum);
    }

    // 줄 간격 속성
    if (labelNbandInfo.data.lineSpacing !== undefined) {
        lineSpacing(labelNbandInfo.data.text,
            labelNbandInfo.data.lineSpacing, "P" + labelNbandInfo.label_type + labelNbandInfo.labelNum);
    }
    var test = $('#' + "P" + labelNbandInfo.label_type + labelNbandInfo.labelNum + ' br');
    // Clipping 속성
    if (labelNbandInfo.data.clipping == 'true') {
        labelNbandInfo.labelId.css({
            'text-overflow': 'clip',
            'overflow': 'hidden'
        });
        clipping(labelNbandInfo.data.text, labelNbandInfo.label_type + labelNbandInfo.labelNum,
            'P' + labelNbandInfo.label_type + labelNbandInfo.labelNum);
    }

    if (labelNbandInfo.data.autosize == true) { // 자동 높이 조절
        autoSizeTrue('P' + labelNbandInfo.label_type + labelNbandInfo.labelNum);
    } else {
        if (labelNbandInfo.data.text !== undefined) {
            switch (labelNbandInfo.data.horizontalTextAlignment) {
                case 'Center' :
                    textAlignCenter(labelNbandInfo.data.text, "P" + labelNbandInfo.label_type + labelNbandInfo.labelNum,
                        labelNbandInfo.data.wordWrap, labelNbandInfo.data.textDirection);
                    break;
                case 'Left' :
                    pId.css('text-align', 'left');
                    break;
                case 'Right' :
                    pId.css('text-align', 'right');
                    break;
                case 'Distributed' :
                    pId.text('');
                    textEqualDivision(labelNbandInfo.data.text, "P" + labelNbandInfo.label_type + labelNbandInfo.labelNum); // 텍스트 수평 정렬이 균등 분할인 경우
                    break;
            }
            switch (labelNbandInfo.data.verticalTextAlignment) {
                case 'Center' :
                    verticalCenter("P" + labelNbandInfo.label_type + labelNbandInfo.labelNum); // 텍스트 수직 정렬이 중간인 경우
                    break;
                case 'Top' :
                    verticalTop("P" + labelNbandInfo.label_type + labelNbandInfo.labelNum); // 텍스트 수직 정렬이 위쪽인 경우
                    break;
                case 'Bottom' :
                    verticalBottom("P" + labelNbandInfo.label_type + labelNbandInfo.labelNum); // 텍스트 수직 정렬이 아래쪽인 경우
                    break;
                case 'Distributed' :
                    verticalCenterEqualDivision(labelNbandInfo.data.text, "P" + labelNbandInfo.label_type
                        + labelNbandInfo.labelNum, labelNbandInfo.data.textDirection); // 텍스트 수직 정렬이 균등 분할인 경우
                    break;
            }
        }
    }
    // 폰트크기 자동 줄어듦
    if (labelNbandInfo.data.autoFontType == 'AutoSmall') {
        fontSizeAutoSmall(labelNbandInfo.data.text, "P" + labelNbandInfo.label_type + labelNbandInfo.labelNum);
    }

    // 기본 여백 미사용
    if (labelNbandInfo.data.isUseBasicInnerMargin == 'false') {
        pId.css({
            'margin-left': labelNbandInfo.data.interMargin.left + 'px',
            'margin-right': labelNbandInfo.data.interMargin.right + 'px',
            'margin-top': labelNbandInfo.data.interMargin.top + 'px',
            'margin-bottom': labelNbandInfo.data.interMargin.bottom + 'px',
        });
    }

    // 중간 줄 그리기
    if (labelNbandInfo.data.isDrawStrikeOutLine == 'true') {
        pId.css('text-decoration', 'line-through');
    }

    // 밑줄 그리기
    if (labelNbandInfo.data.isDrawUnderLine == 'true') {
        pId.css('text-decoration', 'underline');
    }

    // 중간 줄과 밑줄 모두 그릴 때
    if (labelNbandInfo.data.isDrawStrikeOutLine == 'true' && labelNbandInfo.data.isDrawUnderLine == 'true') {
        pId.css('text-decoration', 'line-through underline');
    }

    // 글자 크기 동일하게 하기
    if (labelNbandInfo.data.isSameWidth == 'true') {
        var fontSize = (pId.css('font-size')).split('p');
        pId.css('word-spacing', (fontSize[0] - 1.181) + 'px');
    }
    drd_javascript(labelNbandInfo.data, labelNbandInfo.labelId, labelNbandInfo.data.startBindScript);
    pId.addClass('Label');
    pId.addClass(labelNbandInfo.label_type);
}

/******************************************************************
 기능 : 그라데이션의 시작방향, 방향 등을 판단하여 CSS 속성을 줄 함수를 만든다.
 만든이 : 안예솔
 ******************************************************************/
function gradientCase(startDirection, gradientDirection, gradientColor, backgroundColor, divId) {
    var div = $('#' + divId);
    if (startDirection == 'Forward' && gradientDirection == 'Horizontal') { // 시작 방향 정방향, 방향 수평
        div.css('background', 'linear-gradient(to right, ' + backgroundColor + ', ' + gradientColor + ')');
    } else if (startDirection == 'Forward' && gradientDirection == 'Vertical') { // 시작 방향 정방향, 방향 수직
        div.css('background', 'linear-gradient(to bottom, ' + backgroundColor + ', ' + gradientColor + '');
    } else if (startDirection == 'Forward' && gradientDirection == 'ForwardDiagonal') { // 시작 방향 정방향, 방향 하향
        div.css('background', 'linear-gradient(to bottom right, ' + backgroundColor + ', ' + gradientColor + '');
    } else if (startDirection == 'Forward' && gradientDirection == 'BackwardDiagonal') { // 시작 방향 정방향, 방향 상향
        div.css('background', 'linear-gradient(to bottom left, ' + backgroundColor + ', ' + gradientColor + ')');
    } else if (startDirection == 'RightToLeft' && gradientDirection == 'Horizontal') { // 시작 방향 역방향, 방향 수평
        div.css('background', 'linear-gradient(to left, ' + backgroundColor + ', ' + gradientColor + ')');
    } else if (startDirection == 'RightToLeft' && gradientDirection == 'Vertical') { // 시작 방향 역방향, 방향 수직
        div.css('background', 'linear-gradient(to top, ' + backgroundColor + ', ' + gradientColor + ')');
    } else if (startDirection == 'RightToLeft' && gradientDirection == 'ForwardDiagonal') { // 시작 방향 역방향, 방향 하향
        div.css('background', 'linear-gradient(to bottom right, ' + gradientColor + ', ' + backgroundColor + ')');
    } else if (startDirection == 'RightToLeft' && gradientDirection == 'BackwardDiagonal') { // 시작 방향 역방향, 방향 상향
        div.css('background', 'linear-gradient(to bottom left, ' + gradientColor + ', ' + backgroundColor + ')');
    } else if (startDirection == 'Center' && gradientDirection == 'Horizontal') { // 시작 방향 가운데, 방향 수평
        div.css('background', 'linear-gradient(to right, ' + gradientColor + ' 1%, ' + backgroundColor + ' 50%, ' + gradientColor + ' 100%)');
    } else if (startDirection == 'Center' && gradientDirection == 'Vertical') { // 시작 방향 가운데, 방향 수직
        div.css('background', 'linear-gradient(to bottom, ' + gradientColor + ' 1%, ' + backgroundColor + ' 50%, ' + gradientColor + ' 100%)');
    } else if (startDirection == 'Center' && gradientDirection == 'ForwardDiagonal') { // 시작 방향 가운데, 방향 하향
        div.css('background', 'linear-gradient(to bottom right, ' + gradientColor + ' 1%, ' + backgroundColor + ' 50%, ' + gradientColor + ' 100%)');
    } else if (startDirection == 'Center' && gradientDirection == 'BackwardDiagonal') { // 시작 방향 가운데, 방향 상향
        div.css('background', 'linear-gradient(to top right, ' + gradientColor + ' 1%, ' + backgroundColor + ' 50%, ' + gradientColor + ' 100%)');
    } else if (startDirection == 'Edge' && gradientDirection == 'Horizontal') { // 시작 방향 모서리, 방향 수평
        div.css('background', 'linear-gradient(to right, ' + backgroundColor + ' 1%, ' + gradientColor + ' 50%, ' + backgroundColor + ' 100%)');
    } else if (startDirection == 'Edge' && gradientDirection == 'Vertical') { // 시작 방향 모서리, 방향 수직
        div.css('background', 'linear-gradient(to bottom, ' + backgroundColor + ' 1%, ' + gradientColor + ' 50%, ' + backgroundColor + ' 100%)');
    } else if (startDirection == 'Edge' && gradientDirection == 'ForwardDiagonal') { // 시작 방향 모서리, 방향 하향
        div.css('background', 'linear-gradient(to bottom right, ' + backgroundColor + ' 1%, ' + gradientColor + ' 50%, ' + backgroundColor + ' 100%)');
    } else if (startDirection == 'Edge' && gradientDirection == 'BackwardDiagonal') { // 시작 방향 모서리, 방향 상향
        div.css('background', 'linear-gradient(to top right, ' + backgroundColor + ' 1%, ' + gradientColor + ' 50%, ' + backgroundColor + ' 100%)');
    }
}

/******************************************************************
 기능 : 클립핑을 구현할 함수를 만든다.
 만든이 : 안예솔
 ******************************************************************/
function clipping(text, divId, pTagId) {
    var div = $('#' + divId);
    var tag = $('#' + pTagId);
    var str = text.toString();
    var fontSize = (div.css('font-size')).split('pt');
    var parentWidth = div.css('width').split('px');
    var temp = str.split('<br/>');
    var max = temp[0].length;
    var space = temp[0].match(/\s/gi);
    if (temp.length > 1) {
        for (var i = 1; i < temp.length; i++) {
            temp[i] = temp[i].trim();
            space = temp[i].match(/\s/gi); // 공백 찾기
            if (temp[i].length > max) {
                if (space == null) {
                    max = temp[i].length;
                } else {
                    max = temp[i].length - space.length;
                }
            }
        }
    }
    if (space == null) {
        var spacing = (parentWidth[0] - fontSize[0] * max) / 2;
    } else {
        var spacing = (parentWidth[0] - fontSize[0] * max) / 2 + space.length * (fontSize[0] / 2);
    }
    tag.css({
        'left': spacing + 'px',
        'right': spacing + 'px',
        'position': 'absolute'
    });
}

/******************************************************************
 기능 : 금액을 한글로 바꿔주는 함수를 만든다.
 만든이 : 안예솔
 ******************************************************************/
function numberToKOR(num) {
    var number = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구", "십"];
    var unit = ["", "십", "백", "천", "", "십", "백", "천", "", "십", "백", "천", "", "십", "백", "천", "", "십", "백", "천", "", "십", "백", "천"];
    var result = "";
    for (var i = 0; i < num.length; i++) {
        var str = "";
        var han = number[num.charAt(num.length - (i + 1))];
        if (han != "") str += han + unit[i];
        if (i == 4 && han != "") str += "만";
        if (i == 8 && han != "") str += "억";
        if (i == 12 && han != "") str += "조";
        if (i == 16 && han != "") str += "경";
        if (i == 20 && han != "") str += "해";
        result = str + result;
    }
    if (num != 0) {
        result = result;
    }
    return result;
}

/******************************************************************
 기능 : 금액을 한자로 바꿔주는 함수를 만든다.
 만든이 : 안예솔
 ******************************************************************/
function numberToCHN(num) {
    // 한자 갖은자 사용
    var number = ["", "壹", "貳", "參", "肆", "伍", "陸", "柒", "捌", "玖", "拾"];
    var unit = ["", "拾", "百", "仟", "", "拾", "百", "仟", "", "拾", "百", "仟", "", "拾", "百", "仟", "", "拾", "百", "仟", "", "拾", "百", "仟"];
    var result = "";
    for (var i = 0; i < num.length; i++) {
        var str = "";
        var han = number[num.charAt(num.length - (i + 1))];
        if (han != "") str += han + unit[i];
        if (i == 4 && han != "") str += "萬";
        if (i == 8 && han != "") str += "億";
        if (i == 12 && han != "") str += "兆";
        if (i == 16 && han != "") str += "京";
        if (i == 20 && han != "") str += "垓";
        result = str + result;
    }
    if (num != 0) {
        result = result;
    }
    return result;
}

/******************************************************************
 기능 : borderStyle 을 css 문법에 맞게 수정하기 위한 함수이다.
 만든이 : 안예솔
 ******************************************************************/
function borderDottedLine(borderStyle) {
    switch (borderStyle) {
        case 'Solid' :
            return 'solid';
            break;
        case 'Dash' :
            return 'dashed';
            break;
        case 'Dot' :
            return 'dotted';
            break;
        case 'DashDot' :
            return 'dashed'; // css에 DashDot이라는 속성이 없음
            break;
        case 'DashDotDot' : // css에 DashDotDot이라는 속성이 없음
            return 'dotted';
            break;
        case 'Custom' : // 아직 뭔지 모름
            return 'solid';
            break;
    }
}

/******************************************************************
 기능 : font-size의 단위를 pt로 바꿔주는 함수를 만든다.
 만든이 : 안예솔
 ******************************************************************/
function changeFontUnit(fontSize) {
    // fontSize의 단위를 통일하기위해
    var temp = 0;
    var fontSizePt = 0;
    if (fontSize.indexOf('pt') != -1) {
        fontSizePt = fontSize;
    } else if (fontSize.indexOf('px') != -1) {
        temp = fontSize.split('px');
        fontSizePt = Math.round(temp[0] * 0.75) + 'pt';
    } else if (fontSize.indexOf('in') != -1) {
        temp = fontSize.split('in');
        fontSizePt = Math.round(temp[0] * 72) + 'pt';
    } else if (fontSize.indexOf('mm') != -1) {
        temp = fontSize.split('mm');
        fontSizePt = Math.round(temp[0] * 2.835) + 'pt';
    } else if (fontSize.indexOf('world') != -1) { // px이랑 같음
        temp = fontSize.split('world');
        fontSizePt = Math.round(temp[0] * 0.75) + 'pt';
    } else if (fontSize.indexOf('document') != -1) { // document 단위가 xml에 어떻게 저장되는지 모름
        temp = fontSize.split('document');
        fontSizePt = Math.round(temp[0] * 12 * 2.835) + 'pt';
    }
    return fontSizePt;
}

/******************************************************************
 기능 : 자간 속성을 구현한다.
 만든이 : 안예솔
 ******************************************************************/
function characterSpacing(text, spacing, pTagId) {
    if (text != undefined) {
        var tag = $('#' + pTagId);
        var str = text.toString();
        var strSplit = str.split('<br/>');
        strSplit[0] = strSplit[0].trim();
        var max = strSplit[0].length;
        var parentWidthString = tag.parent().css('width');
        var parentWidth = parentWidthString.split('p');
        var fontSize = (tag.css('font-size')).split('pt');

        if (strSplit.length > 1) {
            for (var i = 1; i < strSplit.length; i++) {
                strSplit[i] = strSplit[i].trim();
                if (max < strSplit[i].length) {
                    max = strSplit[i].length;
                }
            }
        }

        var mid = (parentWidth[0] - (fontSize[0] * max + spacing * (max - 1))) / 2;

        tag.css({
            'margin-left': mid + 'px',
            'margin-right': mid + 'px',
            'letter-spacing': spacing + 'px'
        });
    } else {
    }
}

function z_index_setting(band_name) {
    if (band_name == "BandBackGround") {
        var z_index = -11;
    } else if (band_name == "BandForeGround") {
        var z_index = 100;
    } else {
        var z_index = 2;
    }
    return z_index;
}

/*************************
 * DRD 자바스크립트 구현
 *************************/
function drd_javascript(label, labelId, script) {
    if (labelId !== undefined && script !== undefined) {
        script = str_replace(script, '<br/>', '\n');
        script = str_replace(script, 'TextColor', 'color');
        script = str_replace(script, 'Color.', '');
        script = str_replace(script, 'This.', '$("#' + labelId + '").css(');
    }
}

/**
 DRD 자바스크립트 텍스트 치환 함수
 */
function str_replace(str, searchStr, replaceStr) {
    return str.split(searchStr).join(replaceStr);
}


// var labelNbandInfo = {
//     data : data,
//     divId : divId,
//     band_name : band_name,
//     div : $('#' + divId),
//     labelId : $('#NormalLabel' + normalLabelNum),
//     label_scope : "NormalLabel_scope",
//     divNum : normalLabelNum
// }
function labelPropertyApply(labelNbandInfo) {

    labelNbandInfo.div = $('#' + labelNbandInfo.divId);
    labelNbandInfo.div.css('position', 'relative');
    labelNbandInfo.div.append('<div id = "' + labelNbandInfo.label_type + labelNbandInfo.labelNum + '"></div>');
    labelNbandInfo.labelId = $('#' + labelNbandInfo.label_type + labelNbandInfo.labelNum);

    labelNbandInfo.labelId.addClass(labelNbandInfo.label_scope);
    Lock_check(labelNbandInfo.data, labelNbandInfo.labelId, labelNbandInfo.div);

    // visible 속성
    if (labelNbandInfo.data.visible == 'false') {
        labelNbandInfo.labelId.css('display', 'none');
    }
    // border 속성 관련
    if (labelNbandInfo.data.noBorder == 'true') {
        labelNbandInfo.labelId.css('border', 'none');
    } else {
        if (labelNbandInfo.data.borderThickness !== undefined) {
            var leftBorder = borderDottedLine(labelNbandInfo.data.borderDottedLines.leftDashStyle);
            var rightBorder = borderDottedLine(labelNbandInfo.data.borderDottedLines.rightDashStyle);
            var bottomBorder = borderDottedLine(labelNbandInfo.data.borderDottedLines.bottomDashStyle);
            var topBorder = borderDottedLine(labelNbandInfo.data.borderDottedLines.topDashStyle);
            labelNbandInfo.labelId.css({
                'border-left': labelNbandInfo.data.borderThickness.left + 'px ' + leftBorder + ' ' + labelNbandInfo.data.leftBorderColor,
                'border-right': labelNbandInfo.data.borderThickness.right + 'px ' + rightBorder + ' ' + labelNbandInfo.data.rightBorderColor,
                'border-bottom': labelNbandInfo.data.borderThickness.bottom + 'px ' + bottomBorder + ' ' + labelNbandInfo.data.bottomBorderColor,
                'border-top': labelNbandInfo.data.borderThickness.top + 'px ' + topBorder + ' ' + labelNbandInfo.data.topBorderColor,
                'zIndex': 0
            });
        } else {
            labelNbandInfo.labelId.css({
                'border': '1px solid black',
                'zIndex': 0
            });
        }
    }
    var z_index = z_index_setting(labelNbandInfo.band_name);

    labelNbandInfo.labelId.css({
        'width': labelNbandInfo.data.rectangle.width,
        'height': labelNbandInfo.data.rectangle.height,
        'position': 'absolute',
        'left': labelNbandInfo.data.rectangle.x + 'px',
        'top': labelNbandInfo.data.rectangle.y + 'px',
        // 'text-align': 'center',
        // 'overflow': 'visible',
        'zIndex': z_index,
        'white-space': 'nowrap', // 줄바꿈 안되게하는거
        'background-color': labelNbandInfo.data.backGroundColor, // 배경색
        'color': labelNbandInfo.data.textColor // 글자 색
    });

    // 바코드
    if (labelNbandInfo.data.drawingType !== undefined && labelNbandInfo.data.drawingType === "Barcode") {
        var barcode_text = labelNbandInfo.data.text === undefined ? 'ERROR' : labelNbandInfo.data.text;
        var barcode_type = labelNbandInfo.data.barcodeType === undefined ? 'code39' : labelNbandInfo.data.barcodeType.toLowerCase();
        labelNbandInfo.labelId.barcode(barcode_text, barcode_type);
        labelNbandInfo.labelId.css('overflow', 'visible');

        // 바코드의 높이를 조금 줄여줌
        labelNbandInfo.labelId.children('div:not(:last-child)').css('height',
            Number(labelNbandInfo.labelId.children('div:not(:last-child)').css('height').substring(0,
                labelNbandInfo.labelId.children('div:not(:last-child)').css('height').length - 2)) * 0.8 + 'px'
        );

        var changeRatio = Number(labelNbandInfo.data.rectangle.width)
            / Number(labelNbandInfo.labelId.css('width').substring(0, labelNbandInfo.labelId.css('width').length - 2));

        for (var i = 0; i < labelNbandInfo.labelId.children('div:not(:last-child)').length; i++) {
            if (labelNbandInfo.labelId.children('div:not(:last-child)').eq(i).css('width') !== "0px") {
                labelNbandInfo.labelId.children('div:not(:last-child)').eq(i).css(
                    'width',
                    labelNbandInfo.labelId.children('div:not(:last-child)').eq(i).css('width').substring(
                        0, labelNbandInfo.labelId.children('div:not(:last-child)').eq(i).css('width').length - 2
                    ) * changeRatio + 'px');
            } else {
                labelNbandInfo.labelId.children('div:not(:last-child)').eq(i).css(
                    'border-left-width',
                    labelNbandInfo.labelId.children('div:not(:last-child)').eq(i).css('border-left-width').substring(
                        0, labelNbandInfo.labelId.children('div:not(:last-child)').eq(i).css('border-left-width').length - 2
                    ) * changeRatio + 'px');
            }
        }

        labelNbandInfo.labelId.css('width', labelNbandInfo.data.rectangle.width + 'px');

        // labelNbandInfo.labelId.children('div:not(:last-child)').css(' ')

        // 바코드 폰트 크기를 조금 키워줌
        labelNbandInfo.labelId.children('div:last-child').css({
            'font-size': '15px',
            'font-weight': 'bold',
            'line-height': '15px'
        });

        // 바코드를 감싸는 div의 크기를 글씨 div의 높이 +  바코드 div의 높이로 설정
        labelNbandInfo.labelId.css('height',
            Number(labelNbandInfo.labelId.children('div:first-child').css('height')
                .substring(0, labelNbandInfo.labelId.children('div:first-child').css('height').length - 2))
            + Number(labelNbandInfo.labelId.children('div:last-child').css('height')
                .substring(0, labelNbandInfo.labelId.children('div:last-child').css('height').length - 2)) + 'px'
        );
        return;
    }

    // QR코드
    if (labelNbandInfo.data.drawingType !== undefined && labelNbandInfo.data.drawingType === "QrBarcode") {
        var qrcode_text = labelNbandInfo.data.text === undefined ? '??? ??' : labelNbandInfo.data.text;
        labelNbandInfo.labelId.qrcode({
            render: "canvas",
            width: labelNbandInfo.data.rectangle.width,
            height: labelNbandInfo.data.rectangle.height,
            text: qrcode_text
        });
        labelNbandInfo.labelId.find('canvas').css({
            'width': '100%',
            'height': '100%'
        })
        Lock_check(labelNbandInfo.data, labelNbandInfo.labelId, labelNbandInfo.div);
        return;
    }


    // 라벨 형태 -> 원
    if (labelNbandInfo.data.labelShape == 'Circle') {
        labelNbandInfo.labelId.css({
            'border-radius': '100%', // LabelShape가 원일 때
            'border': labelNbandInfo.data.circleLineThickness + 'px solid '
                + labelNbandInfo.data.circleLineColor // (원 테두리 두께) 속성이 뭔지 모르겠땀
        });
    }

    // 그라데이션을 사용할 때
    if (labelNbandInfo.data.gradientLB.isUseGradient == 'true') {
        gradientCase(labelNbandInfo.data.gradientLB.startGradientDirection,
            labelNbandInfo.data.gradientLB.gradientDirection,
            labelNbandInfo.data.gradientLB.gradientColor,
            labelNbandInfo.data.backGroundColor, labelNbandInfo.label_type + labelNbandInfo.labelNum);
    }

    // 자동 줄바꾸기
    if (labelNbandInfo.data.wordWrap == 'true') {
        labelNbandInfo.labelId.css('white-space', 'normal');
    }

    if (labelNbandInfo.data.base64ImageFromViewer) {
        image_label_making(labelNbandInfo);
    } else {
        label_text_Setting(labelNbandInfo);
    }
}
