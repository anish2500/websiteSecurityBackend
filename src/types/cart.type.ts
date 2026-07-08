export interface CartItemType{
    plantId: string; 
    quantity: number; 
    price: number; 
}

export interface CartType{
    userId: string; 
    items : CartItemType[];
    totalAmount: number;

}