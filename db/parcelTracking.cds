namespace app.parcelTracking;

entity Packages {
    key id : UUID;
        packageNumber : String(30);
        status : String(30);
        receiver : Association to Users;
        shippingAddress : String(30);
        weight : String(10);
        height : String(10);
        date : Date;
}

entity Users {
    key id : UUID;
        first_name : String(30);
        last_name : String(30);
        packages : Association to one Packages on packages.receiver = $self;
}
