namespace app.parcelTracking;

using { cuid, managed } from '@sap/cds/common';

entity Packages : cuid, managed  {
    packageNumber : String(30);
    receiver : Association to Users;
    myAddress:  Association to Addresses;
    shippingAddress : String(30);
    weight : String(10);
    height : String(10);
    signature : String;
    shippingStatus : String enum { NEW; SHIPPING; DELIVERED;  };
    packageStatus: String enum {RECEIVED; DAMAGED;}
}

entity Users : cuid, managed {
        first_name : String(30);
        last_name : String(30);
        packages : Association to one Packages on packages.receiver = $self;
}

entity Addresses : cuid, managed {
   addressLine : String(255);
   city : String(100);
   state : String(100);
   country : String(100);
   postalCode : String(20);    
   packages : Association to many Packages on packages.myAddress = $self;
}