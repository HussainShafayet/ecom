import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaMoneyBillWave } from 'react-icons/fa';

import {
  updateFormData,
  updateTouched,
  setErrors,
  setDistricts,
  setUpazilas,
  handleCheckout,
  resetForm,
  initializeCheckout,
  clearResponseError,
  setSelectedAddressId,
  handleApplyCoupon,
  clearCoupon,
} from '../redux/slice/checkoutSlice';
import {clearCart, selectTotalPrice} from '../redux/slice/cartSlice';
import {clearSectionError} from '../redux/slice/globalErrorSlice';
import {divisionsData,districtsData, upazilasData, dhakaCityData} from '../data/location';
import {CheckoutErrors, CheckoutSummary, Field, PlaceOrderBar, ShowAddress, controlClass, describedBy} from '../components/checkout';
import {CheckoutSkeleton} from '../components/common/skeleton';
import {SectionError} from '../components/common';
import {FIELD_ORDER, normalizePhone, validateCheckout, validateField} from '../utils/checkoutValidation';

const Step = ({ number, title }) => (
  <h2 className="mb-3 flex items-center text-base font-semibold text-gray-900">
    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{number}</span>
    {title}
  </h2>
);

// The order summary while the cart is on its way
const SummarySkeleton = () => (
  <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
    <div className="mb-3 h-5 w-48 rounded bg-gray-300"></div>
    <div className="h-4 w-full rounded bg-gray-200"></div>
  </div>
);

// Mobile first: the folded order summary, then three short steps (contact, delivery, payment), then the total and Place Order in
// a bar fixed above the bottom navigation. From `lg` the summary is open beside the form and the button is under it.
const Checkout = () => {
  const dispatch = useDispatch();
  const {cartLoading, cartItems, cartError} = useSelector((state)=>state.cart);
  const navigate = useNavigate();

  const { isLoading, formData, errors, touched, districts, upazilas, isCheckoutFulfilled, order_id, order, delivery_charges, responseError, checkoutContentLoading, checkoutContentError, couponStatus, couponError, discountAmount, appliedCouponCode} = useSelector(
    (state) => state.checkout
  );

  const { isAuthenticated } = useSelector(
    (state) => state.auth
  );
   const contentError = useSelector((state) => state.globalError.sectionErrors["checkout-content"]);
   const [couponInput, setCouponInput] = useState('');
   const totalPrice = useSelector(selectTotalPrice);

  // Step 1: Initialize checkout on page load if not fulfilled
  useEffect(() => {
    !isCheckoutFulfilled && dispatch(initializeCheckout());

  }, [isCheckoutFulfilled, dispatch]);

  // A refusal from an earlier visit (the customer went to the cart to fix it) is not shown again on arrival
  useEffect(() => {
    dispatch(clearResponseError());
  }, [dispatch]);

  // Step 2: Handle checkout success (redirect + clear cart + reset form)
  useEffect(() => {
    if (isCheckoutFulfilled) {
      order_id && navigate(`/order-confirmation/${order_id}`, { state: { order } }); // the page shows it without another call
      setTimeout(() => {
        dispatch(clearCart());
        dispatch(resetForm());
      }, 500);

    }
  }, [isCheckoutFulfilled, dispatch, navigate, order_id, order]);

  // Step 3: If cart is empty after loading, redirect to products page
  useEffect(() => {
    if (!cartLoading && cartItems.length === 0 && !isCheckoutFulfilled) {
      navigate('/products');
    }
  }, [cartItems, cartLoading, isCheckoutFulfilled, navigate]);

  // What delivery costs: the charge the shop set for the chosen area (0 is a free delivery, only "no charge set" is unknown)
  const deliveryCharge = formData?.shipping_type ? delivery_charges?.[formData.shipping_type] : undefined;
  const deliveryChargeKnown = deliveryCharge !== undefined && deliveryCharge !== null;
  const shippingCost = deliveryChargeKnown ? Number(deliveryCharge) || 0 : 0;
  const discount = couponStatus === 'applied' ? discountAmount : 0;
  const grandTotal = totalPrice + shippingCost - discount;

  // The cart changed since a coupon was applied: its preview no longer matches, so it is cleared (placing the
  // order always re-validates a coupon_code against the real subtotal anyway; this just keeps the summary honest).
  useEffect(() => {
    if (couponStatus === 'applied') {
      dispatch(clearCoupon());
      setCouponInput('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPrice]);

  // Only a field that was left (or every field, once Place Order was pressed) shows its problem
  const problem = (name) => (touched?.[name] && errors?.[name]) || '';
  const clearErrors = (...names) => dispatch(setErrors({ ...errors, ...Object.fromEntries(names.map((name) => [name, ''])) }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateFormData({ [name]: value }));

    // Validate field on change and clear error if valid
    if (value?.trim()) clearErrors(name);

    // Typing the address by hand means it is no longer the saved address that was chosen (the phone, name and e-mail have nothing to do with it)
    isAuthenticated && ['address', 'upazila'].includes(name) && dispatch(setSelectedAddressId(null));
  };

  // 01712345678, 8801712345678 or a pasted "+880 1712-345678" all become the 10 digits after +880
  const handlePhoneChange = (e) => {
    const phone_number = normalizePhone(e.target.value);
    dispatch(updateFormData({ phone_number }));
    if (!validateField('phone_number', phone_number)) clearErrors('phone_number');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    dispatch(updateTouched({ [name]: true }));
    dispatch(setErrors({ ...errors, [name]: validateField(name, value, formData) }));
  };

  const handleLocationType= (e) =>{
    const locationType = e.target.value;

    locationType && dispatch(updateFormData({ shipping_type:locationType, shipping_area: '', division: '', district: '', upazila: '', address: '' }));

    if (locationType.trim()) clearErrors('shipping_type', 'delivery_charge');

    isAuthenticated && dispatch(setSelectedAddressId(null));
  }

  const handleDhakaArea = (e) => {
    const shipping_area = e.target.value;
    dispatch(updateFormData({ shipping_area, division: '', district: '', upazila: '',}));

    if (shipping_area.trim()) clearErrors('shipping_area');
    isAuthenticated && dispatch(setSelectedAddressId(null));
  }

  const handleDivisionChange = (e) => {
    const division = e.target.value;
    const divisionItem = divisionsData.find((item)=> item.name === division);
    if (divisionItem) {
      dispatch(updateFormData({ division:divisionItem.name, district: '', upazila: '' }));
      const divisionDist = districtsData.filter((item)=> item.division_id === divisionItem.id);

      dispatch(setDistricts(divisionDist|| []));
      dispatch(setUpazilas([]));
    }

    if (division.trim()) clearErrors('division');

    isAuthenticated && dispatch(setSelectedAddressId(null));
  };

  const handleDistrictChange = (e) => {
    const district = e.target.value;
    const districtItem = districts.find((item)=> item.name === district);
    if (districtItem) {
      dispatch(updateFormData({ district:districtItem.name, upazila: '' }));

      const upzillaDist = upazilasData.filter((item)=> item.district_id === districtItem.id);

      dispatch(setUpazilas(upzillaDist|| []));
    }
    if (district.trim()) clearErrors('district');

    isAuthenticated && dispatch(setSelectedAddressId(null));
  };

  // Takes the customer to the first field with a problem: on a phone that field can be far from the button just pressed
  const focusFirstProblem = (problems) => {
    const first = FIELD_ORDER.find((name) => problems[name]) || (problems.delivery_charge ? 'shipping_type' : null);
    const field = first && document.getElementById(`field-${first}`);
    if (!field) return;
    field.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    field.focus({ preventScroll: true });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as touched to show errors for untouched fields
    const allTouchedFields = Object.keys(formData).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    dispatch(updateTouched(allTouchedFields));

    const formErrors = validateCheckout(formData, { deliveryChargeKnown });

    if (Object.keys(formErrors).length === 0) {
      const {name,phone_code,phone_number, email, shipping_type,shipping_area, division,district, upazila, address, payment_type } = formData;
      const checkoutBody ={
        name,email,shipping_type,shipping_area,
        phone_number: phone_code + phone_number,
        shipping: null,
        "shipping_division": division,
        "shipping_district": district,
        "shipping_thana": upazila,
        "shipping_address": address,
        payment_type,
        "coupon_code": couponStatus === 'applied' ? appliedCouponCode : '',
        "items" : [],
        "sub_total_price": totalPrice.toFixed(2),
        "delivery_charge": shippingCost,
        "total_price": grandTotal.toFixed(2),
      }
      cartItems?.map((cart)=>{
        checkoutBody.items.push({
            "product_id": cart?.id,
            "variant_id": cart?.variant_id,
            "quantity": cart?.quantity,
            "price": cart?.has_discount? cart?.discount_price : cart?.base_price,
        })
      });

      dispatch(handleCheckout(checkoutBody));
    } else {
      dispatch(setErrors(formErrors));
      focusFirstProblem(formErrors);
    }
  };

  const onApplyCoupon = () => {
    const code = couponInput.trim();
    if (!code || couponStatus === 'validating') return;
    dispatch(handleApplyCoupon({ code, subtotal: totalPrice.toFixed(2), phone_number: formData.phone_code + formData.phone_number }));
  };

  const onRemoveCoupon = () => {
    dispatch(clearCoupon());
    setCouponInput('');
  };

  const retryContent = () => {
    dispatch(clearSectionError('checkout-content'));
    dispatch(initializeCheckout());
  };

  if (contentError) {
    return <SectionError message={contentError} onRetry={retryContent} />;
  }

  // The props one field needs: its id (the page scrolls to it), and its problem announced to a screen reader
  const control = (name, extra = {}) => ({
    id: `field-${name}`,
    name,
    'aria-invalid': Boolean(problem(name)),
    'aria-describedby': describedBy(`field-${name}`, problem(name)),
    ...extra,
  });

  return (
    <>
    {checkoutContentLoading ?
      <CheckoutSkeleton />
     :
      checkoutContentError ? (
      <SectionError message={checkoutContentError} onRetry={retryContent} />
    ) :
    // phone: room for the fixed Place Order bar (72 px) above the bottom nav (56 px); tablet: for the bar alone
    <div className="mx-auto pb-44 md:pb-28 lg:pb-0">
      <h1 className="mb-3 text-xl font-bold sm:text-2xl">Checkout</h1>

      <div className="grid gap-4 lg:grid-cols-[7fr_5fr] lg:gap-6">
        {/* The order: folded above the form on a phone, open in the right column from lg */}
        <div className="lg:col-start-2 lg:row-start-1">
          {cartLoading ? <SummarySkeleton /> : cartError ? (
            <SectionError message={cartError} />
          ) : (
            <CheckoutSummary
              items={cartItems || []}
              subtotal={totalPrice}
              discount={discount}
              shipping={formData?.shipping_type && deliveryChargeKnown ? shippingCost : null}
              total={grandTotal}
              coupon={{
                status: couponStatus,
                error: couponError,
                appliedCode: appliedCouponCode,
                input: couponInput,
                onInput: setCouponInput,
                onApply: onApplyCoupon,
                onRemove: onRemoveCoupon,
              }}
            />
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 lg:col-start-1 lg:row-start-1">
          {/* 1. Contact */}
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <Step number="1" title="Contact" />
            <div className="space-y-3">
              <Field id="field-name" label="Full name" error={problem('name')}>
                <input
                  {...control('name', { type: 'text', autoComplete: 'name', enterKeyHint: 'next' })}
                  value={formData?.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={controlClass(problem('name'))}
                />
              </Field>

              <Field id="field-phone_number" label="Phone number" error={problem('phone_number')}>
                <div className={`flex overflow-hidden rounded-lg border bg-white focus-within:ring-2 focus-within:ring-blue-400 ${problem('phone_number') ? 'border-red-500' : 'border-gray-300'}`}>
                  <span className="flex items-center border-r border-gray-300 bg-gray-50 px-3 text-base text-gray-700">{formData?.phone_code || '+880'}</span>
                  <input
                    {...control('phone_number', { type: 'tel', inputMode: 'numeric', autoComplete: 'tel-national', enterKeyHint: 'next', placeholder: '1712345678' })}
                    value={formData?.phone_number}
                    onChange={handlePhoneChange}
                    onBlur={handleBlur}
                    className="h-12 min-w-0 flex-1 border-none bg-transparent px-3 text-base text-gray-900 focus:outline-none"
                  />
                </div>
              </Field>

              <Field id="field-email" label="Email" optional hint="For your order updates.">
                <input
                  {...control('email', { type: 'email', inputMode: 'email', autoComplete: 'email', enterKeyHint: 'next' })}
                  value={formData?.email}
                  onChange={handleChange}
                  className={controlClass(false)}
                />
              </Field>
            </div>
          </section>

          {/* 2. Delivery */}
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <Step number="2" title="Delivery" />
            {isAuthenticated && <ShowAddress />}

            <div className="space-y-3">
              <Field id="field-shipping_type" label="Delivery area" error={problem('shipping_type') || errors?.delivery_charge}>
                <select
                  {...control('shipping_type')}
                  value={formData?.shipping_type || ''}
                  onChange={handleLocationType}
                  onBlur={handleBlur}
                  className={controlClass(problem('shipping_type') || errors?.delivery_charge)}
                >
                  <option value="">Select delivery area</option>
                  <option value="inside_dhaka">In Dhaka City</option>
                  <option value="outside_dhaka">Out of Dhaka City</option>
                </select>
              </Field>

              {formData?.shipping_type === 'inside_dhaka' && (
                <Field id="field-shipping_area" label="Area in Dhaka" error={problem('shipping_area')}>
                  <select
                    {...control('shipping_area')}
                    value={formData?.shipping_area || ''}
                    onChange={handleDhakaArea}
                    onBlur={handleBlur}
                    className={controlClass(problem('shipping_area'))}
                  >
                    <option value="">Choose your area</option>
                    {dhakaCityData?.map((area) => (
                      <option key={area?.id} value={area?.name}>{area?.name}</option>
                    ))}
                  </select>
                </Field>
              )}

              {formData?.shipping_type === 'outside_dhaka' && (
                <div className="grid gap-3 md:grid-cols-3">
                  <Field id="field-division" label="Division" error={problem('division')}>
                    <select
                      {...control('division')}
                      value={formData?.division || ''}
                      onChange={handleDivisionChange}
                      onBlur={handleBlur}
                      className={controlClass(problem('division'))}
                    >
                      <option value="">Choose division</option>
                      {divisionsData?.map((division) => (
                        <option key={division?.id} value={division?.name}>{division?.name}</option>
                      ))}
                    </select>
                  </Field>

                  <Field id="field-district" label="District" error={problem('district')}>
                    <select
                      {...control('district')}
                      value={formData?.district || ''}
                      onChange={handleDistrictChange}
                      onBlur={handleBlur}
                      disabled={!formData?.division}
                      className={controlClass(problem('district'))}
                    >
                      <option value="">Choose district</option>
                      {districts?.map((district) => (
                        <option key={district?.id} value={district?.name}>{district?.name}</option>
                      ))}
                    </select>
                  </Field>

                  <Field id="field-upazila" label="Upazila / Thana" error={problem('upazila')}>
                    <select
                      {...control('upazila')}
                      value={formData?.upazila || ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={!formData?.district}
                      className={controlClass(problem('upazila'))}
                    >
                      <option value="">Choose upazila / thana</option>
                      {upazilas?.map((station) => (
                        <option key={station?.id} value={station?.name}>{station?.name}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              )}

              <Field id="field-address" label="Full address" error={problem('address')}>
                <textarea
                  {...control('address', { rows: 3, autoComplete: 'street-address', placeholder: 'House, road, area' })}
                  value={formData?.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={controlClass(problem('address'), true)}
                />
              </Field>
            </div>
          </section>

          {/* 3. Payment: cash on delivery is the only way for now, drawn as the chosen one of a choice so more can join it */}
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <Step number="3" title="Payment" />
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-blue-600 bg-blue-50 p-3">
              <input
                type="radio"
                name="payment_type"
                value="cash"
                checked
                onChange={() => dispatch(updateFormData({ payment_type: 'cash' }))}
                className="h-5 w-5 accent-blue-600"
              />
              <FaMoneyBillWave aria-hidden="true" className="text-xl text-green-600" />
              <span>
                <span className="block font-semibold text-gray-900">Cash on Delivery</span>
                <span className="block text-sm text-gray-600">Pay when your order arrives. Nothing is charged now.</span>
              </span>
            </label>
          </section>

          {/* Why the shop refused the order (minimum order, stock, ...): shown right above the button just pressed */}
          <CheckoutErrors errors={responseError} />

          <PlaceOrderBar total={grandTotal} loading={isLoading} deliveryKnown={Boolean(formData?.shipping_type && deliveryChargeKnown)} />
        </form>
      </div>
    </div>
    }
    </>
  );
};

export default Checkout;
