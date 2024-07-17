namespace app.parcelTracking;

using { cuid, managed } from '@sap/cds/common';

entity Packages : cuid, managed  {
    packageNumber : String(30);
    receiver : Association to Users;
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