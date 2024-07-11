namespace app.parcelTracking;

using { cuid, managed } from '@sap/cds/common';

entity Packages : cuid, managed  {
    packageNumber : String(30);
    receiver : Association to Users;
    shippingAddress : String(30);
    weight : String(10);
    height : String(10);
    status : String enum { NEW; SHIPPING; DELIVERED };
}

entity Users : cuid, managed {
        first_name : String(30);
        last_name : String(30);
        packages : Association to one Packages on packages.receiver = $self;
}