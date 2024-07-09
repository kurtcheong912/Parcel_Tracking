namespace app.parcelTracking;

entity Packages {
    key packageNumber : UUID;
        status : String(30);
        receiver : String(30);
        sender : String(30);
        weight : String(10);
        height : String(10);
        date : Date;
}

entity User {
    key id : UUID;
        first_name : String(30);
        last_name : String(30);
        address : String;
}