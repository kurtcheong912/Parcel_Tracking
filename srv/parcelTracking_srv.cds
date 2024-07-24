using app.parcelTracking from '../db/parcelTracking';

service parcelTracking_Service {

    entity Packages as projection on parcelTracking.Packages;
    entity Users as projection on parcelTracking.Users;
    entity Addresses as projection on parcelTracking.Addresses;
}