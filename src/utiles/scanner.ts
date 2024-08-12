/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */
import $ from "jquery"
// var uri = "https://localhost:8003/mfs100/"; //Secure
var uri = "http://localhost:8004/mfs100/"; //Non-Secure
function GetMFS100Info() {
    return GetMFS100Client("info");
}

function GetMFS100KeyInfo(key: any) {
    var MFS100Request = {
        "Key": key,
    };
    var jsondata = JSON.stringify(MFS100Request);
    return PostMFS100Client("keyinfo", jsondata);
}
function CaptureFinger(quality: number, timeout: number) {
    var MFS100Request = {
        "Quality": quality,
        "TimeOut": timeout
    };
    var jsondata = JSON.stringify(MFS100Request);
    return PostMFS100Client("capture", jsondata);
}


function VerifyFinger(ProbFMR: any, GalleryFMR: any) {
    var MFS100Request = {
        "ProbTemplate": ProbFMR,
        "GalleryTemplate": GalleryFMR,
        "BioType": "FMR" // you can paas here BioType as "ANSI" if you are using ANSI Template
    };
    var jsondata = JSON.stringify(MFS100Request);
    return PostMFS100Client("verify", jsondata);
}
function MatchFinger(quality: any, timeout: any, GalleryFMR: any) {
    var MFS100Request = {
        "Quality": quality,
        "TimeOut": timeout,
        "GalleryTemplate": GalleryFMR,
        "BioType": "FMR" // you can paas here BioType as "ANSI" if you are using ANSI Template
    };
    var jsondata = JSON.stringify(MFS100Request);
    return PostMFS100Client("match", jsondata);
}


async function PostMFS100Client(method: string, jsonData: string) {
    try {
        const response = await fetch(`${uri}${method}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: jsonData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return { httpStatus: true, data };
    } catch (error: any) {
        return { httpStatus: false, err: error.message };
    }
}

function GetMFS100Client(method: string) {
    var res;
    $.support.cors = true;
    var httpStaus = false;
    $.ajax({
        type: "GET",
        async: false,
        crossDomain: true,
        url: uri + method,
        contentType: "application/json; charset=utf-8",
        processData: false,
        success: function (data: any) {
            httpStaus = true;
            res = { httpStaus: httpStaus, data: data };
        },
        error: function (jqXHR: any, _ajaxOptions: any, _thrownError: any) {
            res = { httpStaus: httpStaus, err: getHttpError(jqXHR) };
        },
    });
    return res;
}
function getHttpError(jqXHR: { status: number; }) {
    var err = "Unhandled Exception";
    if (jqXHR.status === 0) {
        err = 'Service Unavailable';
    } else if (jqXHR.status == 404) {
        err = 'Requested page not found';
    } else if (jqXHR.status == 500) {
        err = 'Internal Server Error';
    } else {
        err = 'Unhandled Error';
    }
    return err;
}

export { CaptureFinger, VerifyFinger, MatchFinger, GetMFS100Info, GetMFS100KeyInfo }