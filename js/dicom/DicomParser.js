/**
 *  DicomParser.js
 *  Version 0.5
 *  Author: BabuHussain<babuhussain.a@raster.in>
 */
function DicomParser(inputBuffer,reader)
{
	this.inputBuffer=inputBuffer;
	this.reader=reader;	
	this.dicomElement;
	this.parseAll=parseAll;
	this.pixelBuffer;
	this.pixelDataOffset;
	//this.imgEndIndex;
}
var elementIndex=0;

function getPixelBuffer()
{
	return this.pixelBuffer;
}

function parseAll()
{
	var index = 0;
	index=this.readTag(index, 8,0,96, 0,"modality");         // 0x0008, 0x0060
	index=this.readTag(index,16,0,16, 0,"patientName");      // 0x0010, 0x0010
	index=this.readTag(index,16,0,32, 0,"patientId");        // 0x0010, 0x0020
	index=this.readTag(index,40,0,16, 0,"numberOfRows");     // 0x0028, 0x0010
	index=this.readTag(index,40,0,17, 0,"numberOfColumns");  // 0x0028, 0x0011
	index=this.readTag(index,40,0,48, 0,"pixelSpacing");     // 0x0028, 0x0030
	index=this.readTag(index,40,0,80,16,"windowCenter");     // 0x0028, 0x1050
	index=this.readTag(index,40,0,81,16,"windowWidth");      // 0x0028, 0x1051
	index=this.readTag(index,40,0,82,16,"rescaleIntercept"); // 0x0028, 0x1052
	index=this.readTag(index,40,0,83,16,"rescaleSlope");     // 0x0028, 0x1053
	//move to pixel data
	index=this.moveToPixelDataTag(index);
	//read pixel data
    this.readImage(index);	
}

DicomParser.prototype.setDicomElement=function(name,vr,vl,group,element,value,offset)
{
	if(this.dicomElement==null)
	this.dicomElement=new Array();
	
	this.dicomElement[elementIndex++]=new DicomElement(name,vr,vl,group,element,value,offset);
}

DicomParser.prototype.readTag=function(index,firstContent,secondContent,thirdContent,fourthContent,tagName)
{
	var i=index;
	for(; i<this.inputBuffer.length; i++) 
	{
		if(this.reader.readNumber(1,i)==firstContent 
		    && this.reader.readNumber(1,i+1)==secondContent
		    && this.reader.readNumber(1,i+2)==thirdContent
		    && this.reader.readNumber(1,i+3)==fourthContent)
		{
			i=i+4;
			var vr= this.reader.readString(2,i);
			var vl=this.reader.readNumber(2,i+2);
			var val=this.reader.readString(vl,i+4);
			var tagValue=val.split("\\");				
			this.setDicomElement(tagName,vr,vl,firstContent+secondContent,thirdContent+fourthContent,tagValue,i-4);
			i=i+4+vl; 					  
			break;
		}    
	}
	return i;
}

DicomParser.prototype.moveToPixelDataTag=function(index)
{
	var i=index;
	for(; i<this.inputBuffer.length; i++)
	{
		if(this.reader.readNumber(1,i)==224 &&this.reader.readNumber(1,i+1)==127&&this.reader.readNumber(1,i+2)==16&&this.reader.readNumber(1,i+3)==0)
		{			
			i=i+4;
			var vr= this.reader.readString(2,i);
			var vl=this.reader.readNumber(2,i+2);
			//i=i+28;
			//i=i+32;
			//alert("vr"+vr+" vl:"+vl);
			break;
		}    
	} 
	this.pixelDataOffset=i;
	return i;
}

DicomParser.prototype.readImage=function(index)
{
	this.pixelBuffer = new Array(512*512*2);
	var i=index;
	var pixelIndex=0;
	for(; i<this.inputBuffer.length; i+=2) 
	{     
		this.pixelBuffer[pixelIndex]=this.reader.readNumber(2,i);
		//document.write(this.pixelBuffer[pixelIndex]+"__");
		pixelIndex++;
	}
	//return pixelIndex;

}
