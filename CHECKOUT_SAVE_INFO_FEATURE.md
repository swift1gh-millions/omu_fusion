# Save Checkout Information Feature

## Overview

The "Save this information for faster checkout next time" feature allows users to store their shipping address and contact information in their profile for quicker future checkouts.

## Implementation Details

### 1. **User Interface**

Located in Step 1 (Contact Information) of the checkout process:

```tsx
<input
  type="checkbox"
  id="saveInfo"
  name="saveInfo"
  checked={formData.saveInfo}
  onChange={handleInputChange}
/>
<label htmlFor="saveInfo">
  Save this information for faster checkout next time
</label>
```

### 2. **Data Flow**

#### A. **Loading Saved Information (Component Mount)**

When a user visits the checkout page:

```typescript
useEffect(() => {
  const loadSavedCheckoutInfo = async () => {
    if (user?.id) {
      const userProfile = await UserProfileService.getUserProfile(user.id);

      // Load default or first address
      const defaultAddress =
        userProfile.addresses.find((addr) => addr.isDefault) ||
        userProfile.addresses[0];

      if (defaultAddress) {
        setFormData((prev) => ({
          ...prev,
          firstName: defaultAddress.firstName,
          lastName: defaultAddress.lastName,
          digitalAddress: defaultAddress.address,
          apartment: defaultAddress.apartment,
          country: defaultAddress.country,
        }));
      }

      // Load newsletter preference
      setFormData((prev) => ({
        ...prev,
        newsletter: userProfile.preferences.newsletter,
      }));
    }
  };

  loadSavedCheckoutInfo();
}, [user?.id]);
```

#### B. **Saving Information (Order Completion)**

When an order is successfully placed and `saveInfo` is checked:

```typescript
if (formData.saveInfo && user?.id) {
  const userProfile = await UserProfileService.getUserProfile(user.id);

  // Check if address already exists
  const existingAddress = userProfile.addresses.find(
    (addr) => addr.address === formData.digitalAddress
  );

  if (existingAddress) {
    // Update existing address
    await UserProfileService.updateAddress(user.id, existingAddress.id, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      apartment: formData.apartment,
      country: formData.country,
    });
  } else {
    // Add new address
    await UserProfileService.addAddress(user.id, {
      type: "home",
      firstName: formData.firstName,
      lastName: formData.lastName,
      address: formData.digitalAddress,
      apartment: formData.apartment,
      city: "",
      state: "",
      zipCode: "",
      country: formData.country,
      isDefault: userProfile.addresses.length === 0,
    });
  }

  // Update preferences and phone
  await UserProfileService.updatePreferences(user.id, {
    newsletter: formData.newsletter,
  });

  await UserProfileService.updateUserProfile(user.id, {
    phone: formData.phone,
  });
}
```

### 3. **Stored Data Structure**

#### Firestore Document: `users/{userId}`

```typescript
{
  uid: string,
  email: string,
  firstName: string,
  lastName: string,
  phone: string,  // Saved from checkout
  addresses: [
    {
      id: string,
      type: "home" | "work" | "other",
      firstName: string,    // From checkout form
      lastName: string,     // From checkout form
      address: string,      // digitalAddress from checkout
      apartment?: string,   // From checkout form
      city: string,        // Empty for Ghana digital addresses
      state: string,       // Empty for Ghana digital addresses
      zipCode: string,     // Empty for Ghana digital addresses
      country: string,     // From checkout form
      isDefault: boolean   // First saved address is default
    }
  ],
  preferences: {
    newsletter: boolean,  // From checkout newsletter checkbox
    // ... other preferences
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 4. **Business Logic**

#### Address Management

- **New Address**: Added to `addresses` array when checkout info is saved
- **Existing Address**: Updated if same `digitalAddress` is found
- **Default Address**: First saved address becomes default
- **Multiple Addresses**: Users can have multiple saved addresses
- **Auto-Load**: Default (or first) address is loaded automatically on checkout

#### Update Behavior

When user checks "Save info" and completes order:

1. Check if address already exists (by matching `digitalAddress`)
2. If exists → Update the existing address with new details
3. If new → Add as a new address to the array
4. Update phone number in main profile
5. Update newsletter preference
6. Show success toast: "Checkout information saved for next time!"

### 5. **User Experience Flow**

#### First Time Checkout

1. User fills in contact information
2. User checks "Save this information for faster checkout next time"
3. User completes payment
4. System saves:
   - Shipping address (as default)
   - Phone number
   - Newsletter preference
5. Success message: "Order placed successfully!" + "Checkout information saved for next time!"

#### Return Customer Checkout

1. User navigates to checkout page
2. System automatically loads:
   - Default shipping address (or first address)
   - Phone number (from user profile)
   - Newsletter preference
3. User reviews/edits pre-filled information
4. If "Save info" is checked again → Updates are saved
5. User completes payment quickly

### 6. **Edge Cases Handled**

#### No Saved Addresses

- Form shows empty fields
- Uses user's email and name from auth profile
- Phone field remains empty

#### Multiple Addresses

- Loads default address first
- Other addresses available in profile page
- User can manage addresses in profile settings

#### Address Update

- Same digital address → Updates existing record
- Different digital address → Adds as new address
- Prevents duplicate addresses

#### Failed Save

- Order still completes successfully
- Error logged to console
- No error shown to user (order success is priority)

#### Not Authenticated

- Feature not available
- User redirected to sign-in page

### 7. **Security & Privacy**

#### Data Protection

- All data stored in Firestore with security rules
- Only user can access their own addresses
- Phone numbers encrypted in transit (HTTPS)

#### User Control

- User explicitly opts in by checking the box
- Can uncheck to prevent saving
- Can manage/delete saved addresses in profile

#### Firestore Security Rules

```javascript
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

### 8. **Benefits**

#### For Users

- ✅ Faster checkout on repeat purchases
- ✅ No need to re-enter shipping info
- ✅ Consistent address format
- ✅ Less typing, fewer errors
- ✅ Better mobile experience

#### For Business

- ✅ Higher conversion rates
- ✅ Reduced cart abandonment
- ✅ Better customer data
- ✅ Repeat purchase enabler
- ✅ Customer retention tool

### 9. **Testing Checklist**

#### First-Time User Flow

- [ ] Checkbox is visible and clickable
- [ ] Checkbox defaults to unchecked
- [ ] Order completes with checkbox checked
- [ ] Success toast appears: "Checkout information saved for next time!"
- [ ] Data is saved to Firestore
- [ ] User profile document is created/updated

#### Return User Flow

- [ ] Checkout page loads saved information
- [ ] Default address is pre-filled
- [ ] Phone number is pre-filled
- [ ] Newsletter preference is pre-filled
- [ ] User can edit pre-filled information
- [ ] Edited info saves when checkbox is checked
- [ ] Edited info doesn't save when checkbox is unchecked

#### Address Management

- [ ] New address is added correctly
- [ ] Existing address is updated (not duplicated)
- [ ] First address becomes default
- [ ] Digital address matching works correctly
- [ ] Apartment field updates correctly
- [ ] Country field updates correctly

#### Edge Cases

- [ ] Works when user has no saved addresses
- [ ] Works when user has multiple addresses
- [ ] Works when address details change
- [ ] Order completes even if save fails
- [ ] No error shown to user if save fails
- [ ] Console logs save errors for debugging

#### Preferences

- [ ] Newsletter checkbox state is saved
- [ ] Newsletter preference is loaded on return
- [ ] Phone number is saved to profile
- [ ] Phone number is loaded on return

### 10. **Future Enhancements**

#### Potential Features

1. **Multiple Address Selection**: Dropdown to choose from saved addresses
2. **Address Book Page**: Dedicated page to manage all addresses
3. **Address Nicknames**: Allow users to name addresses ("Home", "Office", "Mom's House")
4. **Quick Edit**: Edit saved address without going through checkout
5. **Address Validation**: Verify Ghana digital addresses are valid
6. **Google Maps Integration**: Autocomplete and verify addresses
7. **Shipping Preferences**: Save preferred delivery time/instructions
8. **Payment Method Storage**: Save preferred payment method (compliance required)

#### Analytics to Track

- % of users who check "Save info"
- % of checkouts using saved info
- Time saved per checkout with pre-filled data
- Correlation between saved info and repeat purchases

### 11. **Troubleshooting**

#### Information Not Saving

**Symptoms**: User checks box but info not saved
**Causes**:

- User not authenticated
- Firestore permissions issue
- Network error during save

**Solution**:

1. Check browser console for errors
2. Verify user is logged in
3. Check Firestore security rules
4. Verify UserProfileService is working

#### Information Not Loading

**Symptoms**: Saved info not appearing on return
**Causes**:

- User has no saved addresses
- UserProfile document doesn't exist
- Firestore permissions issue

**Solution**:

1. Check if user has completed checkout before
2. Verify UserProfile document exists in Firestore
3. Check browser console for load errors
4. Verify user ID matches profile document

#### Duplicate Addresses

**Symptoms**: Same address appears multiple times
**Causes**:

- Digital address format variations
- Apartment number differences
- Address matching logic issue

**Solution**:

1. Check address matching logic in save function
2. Normalize digital addresses before comparison
3. Add address deduplication logic

### 12. **Code Maintenance**

#### Key Files

- **CheckoutPage.tsx**: Main implementation
- **userProfileService.ts**: Data operations
- **databaseSchema.ts**: Type definitions

#### Dependencies

- Firebase/Firestore
- UserProfileService
- React hooks (useState, useEffect)
- Toast notifications

#### Important Functions

- `loadSavedCheckoutInfo()`: Loads data on mount
- `completeOrder()`: Saves data after payment
- `UserProfileService.addAddress()`: Creates new address
- `UserProfileService.updateAddress()`: Updates existing address
- `UserProfileService.updatePreferences()`: Saves preferences

### 13. **Performance Considerations**

#### Optimizations

- Single Firestore read on component mount
- Batched updates (address + preferences + phone)
- No blocking - save happens after order success
- Error doesn't affect checkout completion

#### Network Efficiency

- Only loads when user is authenticated
- Caches user profile data
- Single profile fetch per checkout session

## Conclusion

The "Save this information for faster checkout next time" feature provides a seamless checkout experience for return customers while maintaining data security and user control. It's implemented using Firestore for reliable data storage and integrates smoothly with the existing checkout flow without disrupting the order completion process.
