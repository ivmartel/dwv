/**
 *  VR.js
 *  Version 0.5
 *  Author: BabuHussain<babuhussain.a@raster.in>
 */

function VR()
{
    this.AE="AE";     
    this.AS="AS";     
    this.AT="AT";   
    this.CS="CS"; 
    this.DA="DA";  
    this.DS="DS";   
    this.DT="DT";   
    this.FD="FD";  
    this.FL="FL";   
    this.IS="IS";   
    this.LO="IO";   
    this.LT="LT";   
    this.OB="OB";  
    this.OF="OF"; 
    this.OW="OW";  
    this.PN="PN";  
    this.SH="SH";   
    this.SL="SL";  
    this.SQ="SQ";   
    this.SS="SS";   
    this.ST="ST";   
    this.TM="TM";   
    this.UI="UI";   
    this.UL="UL";      
    this.UN="UN";   
    this.US="US";  
    this.UT="UT";
     
    function valueOf(vr)
    {
        switch (vr)
        {
            case this.AE:
               return this.AE;
            case this.AS:
               return this.AS;
            case this.AT:
               return this.AT;
            case this.CS:
               return this.CS;
            case this.DA:
               return this.DA;
            case this.DS:
               return this.DS;
            case this.DT:
               return this.DT;
            case this.FD:
               return this.FD;
            case this.FL:
               return this.FL;
            case this.IS:
               return this.IS;
            case this.LO:
               return this.LO;
            case this.LT:
               return this.LT;
            case this.OB:
               return this.OB;
            case this.OF:
               return this.OF;
            case this.OW:
               return this.OW;
            case this.PN:
               return this.PN;
            case this.SH:
               return this.SH;
            case this.SL:
               return this.SL;
            case this.SQ:
               return this.SQ;
            case this.SS:
               return this.SS;
            case this.ST:
               return this.ST;
            case this.TM:
               return this.TM;
            case this.UI:
               return this.UI;
            case this.UL:
               return this.UL;
            case this.UN:
               return this.UN;
            case this.US:
               return this.US;
            case this.UT:
               return this.UT;
        }
    throw new Error("VR does not match ");
    }    
}

