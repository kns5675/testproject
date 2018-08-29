// 작성자 : 전형준
var bandNum = 1;

/***********************************************************
 * 임시로 만든 함수.
 * 리포트에 밴드들을 그려줌(ChildBands 들을 그려주기 위해 재귀함수로 사용)
 * 인자 bands : 그려줄 밴드들 // layerName : 어느 Layer에 그려줄 지
 *
 * 수정 : 2018-08-22
 * BandData일 경우 페이지 크기에 맞게 BandData Height 변경
 * from 구영준
 * *********************************************************/
function drawBand(bands, layerName, reportHeight){
    bands.forEach(function (band) { // 밴드 갯수만큼 반복문 돌음
        // 페이지 헤더 밴드의 속성 '첫 페이지 출력 생략(PageOutputSkip)' 속성값이 'true'면 출력X
        if(band.attributes["xsi:type"] === "BandPageHeader" && band.pageOutputSkip === "true"){
            return;
        }

        // 타이틀 밴드 - 첫 페이지가 아니면 출력X
        if(band.attributes["xsi:type"] === "BandTitle" && reportPageCnt > 1) {
            return;
        }

        if(band.childHeaderBands !== null){ // 자식헤더밴드에서 재호출
            drawBand(band.childHeaderBands, layerName, reportHeight);
        }
        // if(band.childBands !== null){
        //     drawBand(band.childBands);
        // }
        // childBands라는 애가 필요없는 애일 수 있고
        // 어디서 재귀호출해야 할 지 명확치 않아 우선 주석처리

        // 밴드 div를 그려주고 CSS 입힘
        var div_id = 'band' + (bandNum++);
        $('#' + layerName).append("<div id='" + div_id + "' class='Band " + band.attributes["xsi:type"] + "'>" + band.name + "</div>");

        if (band.attributes["xsi:type"] == 'BandData') {
            var dataBandHeight = getBandHeight(bands, reportHeight);
            $('#' + div_id).css({
                'width': band.rectangle.width,
                'height': dataBandHeight,
                'border-bottom': "1px solid red"
            });
        } else {
            $('#' + div_id).css({
                'width': band.rectangle.width,
                'height': band.rectangle.height,
                'border-bottom': "1px solid red"
            });
        }

        judgementControlList(band, div_id); // 라벨을 그려줌

        if(band.attributes["xsi:type"] === "BandGroupHeader") {
            groupDataRow = 0;
        }
        if(band.attributes["xsi:type"] === "BandGroupFooter") {
            curDatarow += (groupFieldArray[groupFieldNum].length-1);
            groupFieldNum++;
        }



        if(band.childFooterBands !== null){ // 자식 풋터 밴드에서 재호출
            drawBand(band.childFooterBands, layerName, reportHeight);
        }

    });
}
