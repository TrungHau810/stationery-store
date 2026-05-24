import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useContext, useEffect, useState } from "react";
import Apis, { authApis, endpoint, } from "../configs/Apis";
import { MyCartContext, MyUserContext, } from "../configs/Contexts";
import Swal from "sweetalert2";
import { Link, useNavigate, } from "react-router-dom";
import { decreaseQty, increaseQuantity, removeItem, } from "../utils/Cart";
import { LoadingSpinner } from "./layout/LoadingSpinner";

const Cart = () => {

    const [cart, setCart] = useState([]);
    const [, dispatchCart] = useContext(MyCartContext);
    const [user] = useContext(MyUserContext);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [loyaltyPoint, setLoyaltyPoint] =
        useState({});

    const [discountByVoucher, setDiscountByVoucher] =
        useState(0);

    const [allVouchers, setAllVouchers] =
        useState([]);

    const discountByPoint =
        Math.floor(
            loyaltyPoint.total_point / 1000
        ) * 1000;

    const [receiverName, setReceiverName] =
        useState("");

    const [receiverPhone, setReceiverPhone] =
        useState("");

    const [address, setAddress] =
        useState("");

    const nav = useNavigate();

    const paymentMethods = [
        {
            value: "cash",
            label: "Thanh toán khi nhận hàng (COD)",
            logo: "/cash.jpg",
        },
        {
            value: "momo",
            label: "Thanh toán Momo",
            logo: "/momo.png",
        },
        {
            value: "vnpay",
            label: "Thanh toán VNPAY",
            logo: "/vnpay.jpg",
        },
    ];

    // LOAD CART
    const loadCart = async () => {
        try {
            setDataLoading(true);

            const res =
                await authApis().get(
                    endpoint["cart"]
                );

            const items =
                res.data?.[0]?.items || [];

            setCart(items);

            const totalQty = items.reduce(
                (sum, item) =>
                    sum + item.quantity,
                0
            );

            dispatchCart({
                type: "update",
                payload: totalQty,
            });
        } catch (err) {
            console.error(err);
        } finally {
            setDataLoading(false);
        }
    };

    // VOUCHERS
    const fetchAllVouchers = async () => {
        try {
            const res = await Apis.get(
                endpoint["discount"]
            );

            setAllVouchers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // LOYALTY
    const fetchLoyaltyPoints = async () => {
        try {
            const res =
                await authApis().get(
                    endpoint["loyalty"]
                );

            setLoyaltyPoint(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // APPLY VOUCHER
    const handleApplyVoucher = (
        voucherId
    ) => {
        const voucher =
            allVouchers.find(
                (v) =>
                    v.id ===
                    parseInt(voucherId)
            );

        if (!voucher)
            return setAppliedVoucher(null);

        const isApplicable = cart.some(
            (item) =>
                voucher.products.some(
                    (p) =>
                        p.id ===
                        item.product.id
                )
        );

        if (!isApplicable) {
            Swal.fire({
                icon: "error",
                title:
                    "Không thể áp dụng",
                text:
                    "Voucher không phù hợp với giỏ hàng.",
            });

            setAppliedVoucher(null);
            return;
        }

        setAppliedVoucher(voucher);

        Swal.fire({
            icon: "success",
            title:
                "Áp dụng voucher thành công",
            timer: 1500,
            showConfirmButton: false,
        });
    };

    // UPDATE VOUCHER
    useEffect(() => {
        if (appliedVoucher) {
            const eligibleItems =
                cart.filter((item) =>
                    appliedVoucher.products.some(
                        (p) =>
                            p.id ===
                            item.product.id
                    )
                );

            if (
                eligibleItems.length === 0
            ) {
                setAppliedVoucher(null);

                setDiscountByVoucher(0);

                return;
            }

            const eligibleTotal =
                eligibleItems.reduce(
                    (sum, item) =>
                        sum +
                        item.quantity *
                        parseFloat(
                            item.product.price
                        ),
                    0
                );

            setDiscountByVoucher(
                (appliedVoucher.discount /
                    100) *
                eligibleTotal
            );
        } else {
            setDiscountByVoucher(0);
        }
    }, [appliedVoucher, cart]);

    useEffect(() => {
        if (user) {
            loadCart();

            fetchLoyaltyPoints();

            setReceiverName(
                user.full_name || ""
            );

            setReceiverPhone(
                user.number_phone || ""
            );

            setAddress(
                user.address || ""
            );
        }
        // eslint-disable-next-line
    }, [user]);

    useEffect(() => {
        fetchAllVouchers();
    }, []);

    // CHANGE QUANTITY
    const handleIncrease = async (
        item
    ) => {
        try {
            setActionLoading(item.id);

            await increaseQuantity(
                item,
                setCart,
                loadCart
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleDecrease = async (
        item
    ) => {
        try {
            setActionLoading(item.id);

            await decreaseQty(
                item,
                setCart,
                loadCart
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemove = async (
        item
    ) => {
        try {
            setActionLoading(item.id);

            await removeItem(
                item,
                setCart,
                loadCart
            );
        } finally {
            setActionLoading(null);
        }
    };

    // ORDER
    const handleConfirmOrder =
        async () => {
            if (
                !receiverName ||
                !receiverPhone ||
                !address
            ) {
                Swal.fire({
                    icon: "error",
                    title:
                        "Thiếu thông tin",
                    text:
                        "Vui lòng nhập đầy đủ thông tin nhận hàng.",
                });

                return;
            }

            try {
                setLoading(true);

                const response =
                    await authApis().post(
                        endpoint[
                        "create_order"
                        ],
                        {
                            order_details:
                                cart.map(
                                    (
                                        item
                                    ) => ({
                                        product_id:
                                            item
                                                .product
                                                .id,
                                        quantity:
                                            item.quantity,
                                    })
                                ),

                            discount:
                                appliedVoucher?.id ||
                                null,

                            payment_method:
                                paymentMethod,

                            name_customer:
                                receiverName,

                            number_phone:
                                receiverPhone,

                            address,
                        }
                    );

                if (
                    response.status ===
                    201
                ) {
                    Swal.fire({
                        icon: "success",
                        title:
                            "Đặt hàng thành công",
                    }).then(async () => {
                        await authApis().post(
                            endpoint[
                            "clear_cart"
                            ]
                        );

                        setCart([]);

                        dispatchCart({
                            type: "update",
                            payload: 0,
                        });

                        if (
                            paymentMethod ===
                            "cash"
                        ) {
                            return nav(
                                "/purchase/orders/" +
                                response
                                    .data.id
                            );
                        }

                        nav("/payment", {
                            state: {
                                orderId:
                                    response
                                        .data.id,
                                paymentMethod,
                                amount:
                                    totalAmount,
                            },
                        });
                    });
                }
            } catch (err) {
                Swal.fire({
                    icon: "error",
                    title:
                        "Lỗi đặt hàng",
                    text:
                        err.response.data[0],
                });
            } finally {
                setLoading(false);
            }
        };

    const total = cart.reduce(
        (sum, item) =>
            sum +
            parseFloat(
                item.product.price
            ) *
            item.quantity,
        0
    );

    const totalAmount =
        total -
        discountByPoint -
        discountByVoucher;

    return (
        <div
            className="
                min-h-screen
                bg-slate-100
                py-8 px-4
            "
        >
            {dataLoading && (
                <LoadingSpinner content="Đang tải giỏ hàng..." />
            )}

            {cart.length === 0 ? (
                <div
                    className="
                        max-w-xl mx-auto
                        bg-white
                        rounded-3xl
                        shadow-lg
                        p-10
                        text-center
                    "
                >
                    <img
                        src="/empty-cart.png"
                        alt="Empty cart"
                        className="
                            w-52 h-52
                            object-contain
                            mx-auto mb-6
                        "
                    />

                    <h2
                        className="
                            text-3xl font-bold
                            text-slate-800
                            mb-3
                        "
                    >
                        Giỏ hàng trống
                    </h2>

                    <p className="text-slate-500 mb-6">
                        {user
                            ? "Hãy thêm sản phẩm vào giỏ hàng."
                            : "Vui lòng đăng nhập để sử dụng giỏ hàng."}
                    </p>

                    <Link
                        to={
                            user
                                ? "/"
                                : "/login"
                        }
                        className="
                            inline-flex
                            items-center
                            justify-center
                            h-12 px-8
                            rounded-2xl
                            bg-blue-600
                            text-white
                            font-semibold
                            hover:bg-blue-700
                            transition
                        "
                    >
                        {user
                            ? "Tiếp tục mua sắm"
                            : "Đăng nhập"}
                    </Link>
                </div>
            ) : (
                <div
                    className="
                        max-w-7xl
                        mx-auto
                        grid grid-cols-1
                        xl:grid-cols-3
                        gap-8
                    "
                >

                    {/* LEFT */}
                    <div className="xl:col-span-2 space-y-6">

                        {/* SHIPPING */}
                        <div
                            className="
                                bg-white
                                rounded-3xl
                                shadow-lg
                                p-6
                            "
                        >
                            <h2
                                className="
                                    text-2xl
                                    font-bold
                                    text-slate-800
                                    mb-6
                                "
                            >
                                Thông tin nhận hàng
                            </h2>

                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    md:grid-cols-2
                                    gap-5
                                "
                            >
                                <input
                                    value={
                                        receiverName
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setReceiverName(
                                            e.target
                                                .value
                                        )
                                    }
                                    placeholder="Họ tên"
                                    className="
                                        h-12
                                        rounded-2xl
                                        border
                                        border-slate-200
                                        bg-slate-50
                                        px-4
                                        outline-none
                                        focus:ring-4
                                        focus:ring-blue-100
                                    "
                                />

                                <input
                                    value={
                                        receiverPhone
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setReceiverPhone(
                                            e.target
                                                .value
                                        )
                                    }
                                    placeholder="Số điện thoại"
                                    className="
                                        h-12
                                        rounded-2xl
                                        border
                                        border-slate-200
                                        bg-slate-50
                                        px-4
                                        outline-none
                                        focus:ring-4
                                        focus:ring-blue-100
                                    "
                                />

                                <textarea
                                    rows={4}
                                    value={
                                        address
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setAddress(
                                            e.target
                                                .value
                                        )
                                    }
                                    placeholder="Địa chỉ nhận hàng"
                                    className="
                                        md:col-span-2
                                        rounded-2xl
                                        border
                                        border-slate-200
                                        bg-slate-50
                                        px-4 py-3
                                        resize-none
                                        outline-none
                                        focus:ring-4
                                        focus:ring-blue-100
                                    "
                                />
                            </div>
                        </div>

                        {/* CART */}
                        <div
                            className="
                                bg-white
                                rounded-3xl
                                shadow-lg
                                p-6
                            "
                        >
                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    mb-6
                                "
                            >
                                <h2
                                    className="
                                        text-2xl
                                        font-bold
                                        text-slate-800
                                    "
                                >
                                    Giỏ hàng
                                </h2>

                                <div
                                    className="
                                        px-4 py-2
                                        rounded-2xl
                                        bg-blue-50
                                        text-blue-600
                                        font-semibold
                                        text-sm
                                    "
                                >
                                    {cart.length} sản phẩm
                                </div>
                            </div>

                            <div className="space-y-5">

                                {cart.map(
                                    (
                                        item
                                    ) => (
                                        <div
                                            key={
                                                item.id
                                            }
                                            className="
                                                border
                                                border-slate-100
                                                rounded-3xl
                                                p-4
                                                hover:shadow-md
                                                transition
                                            "
                                        >
                                            <div
                                                className="
                                                    flex
                                                    flex-col
                                                    lg:flex-row
                                                    gap-5
                                                "
                                            >

                                                {/* IMAGE */}
                                                <div
                                                    className="
                                                        relative
                                                        w-full
                                                        lg:w-36
                                                        h-36
                                                        rounded-2xl
                                                        overflow-hidden
                                                        bg-slate-100
                                                    "
                                                >
                                                    <img
                                                        src={
                                                            item
                                                                .product
                                                                .image
                                                        }
                                                        alt={
                                                            item
                                                                .product
                                                                .name
                                                        }
                                                        className="
                                                            w-full
                                                            h-full
                                                            object-cover
                                                        "
                                                    />
                                                </div>

                                                {/* INFO */}
                                                <div className="flex-1">

                                                    <h3
                                                        className="
                                                            text-xl
                                                            font-bold
                                                            text-slate-800
                                                            mb-2
                                                        "
                                                    >
                                                        {
                                                            item
                                                                .product
                                                                .name
                                                        }
                                                    </h3>

                                                    <p
                                                        className="
                                                            text-blue-600
                                                            font-bold
                                                            text-lg
                                                            mb-4
                                                        "
                                                    >
                                                        {parseFloat(
                                                            item
                                                                .product
                                                                .price
                                                        ).toLocaleString()}
                                                        đ
                                                    </p>

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-3
                                                        "
                                                    >

                                                        {/* QTY */}
                                                        <div
                                                            className="
                                                                flex
                                                                items-center
                                                                bg-slate-100
                                                                rounded-2xl
                                                                p-1
                                                            "
                                                        >
                                                            <button
                                                                disabled={
                                                                    actionLoading ===
                                                                    item.id
                                                                }
                                                                onClick={() =>
                                                                    handleDecrease(
                                                                        item
                                                                    )
                                                                }
                                                                className="
                                                                    w-10 h-10
                                                                    rounded-xl
                                                                    flex
                                                                    items-center
                                                                    justify-center
                                                                    hover:bg-white
                                                                    transition
                                                                "
                                                            >
                                                                <MinusIcon className="w-4 h-4" />
                                                            </button>

                                                            <div
                                                                className="
                                                                    w-12
                                                                    text-center
                                                                    font-bold
                                                                "
                                                            >
                                                                {actionLoading ===
                                                                    item.id ? (
                                                                    <div
                                                                        className="
                                                                            w-5 h-5
                                                                            border-2
                                                                            border-blue-500
                                                                            border-t-transparent
                                                                            rounded-full
                                                                            animate-spin
                                                                            mx-auto
                                                                        "
                                                                    />
                                                                ) : (
                                                                    item.quantity
                                                                )}
                                                            </div>

                                                            <button
                                                                disabled={
                                                                    actionLoading ===
                                                                    item.id
                                                                }
                                                                onClick={() =>
                                                                    handleIncrease(
                                                                        item
                                                                    )
                                                                }
                                                                className="
                                                                    w-10 h-10
                                                                    rounded-xl
                                                                    flex
                                                                    items-center
                                                                    justify-center
                                                                    hover:bg-white
                                                                    transition
                                                                "
                                                            >
                                                                <PlusIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        {/* DELETE */}
                                                        <button
                                                            disabled={
                                                                actionLoading ===
                                                                item.id
                                                            }
                                                            onClick={() =>
                                                                handleRemove(
                                                                    item
                                                                )
                                                            }
                                                            className="
                                                                h-11
                                                                px-4
                                                                rounded-2xl
                                                                bg-red-50
                                                                text-red-500
                                                                font-semibold
                                                                flex
                                                                items-center
                                                                gap-2
                                                                hover:bg-red-100
                                                                transition
                                                            "
                                                        >
                                                            <TrashIcon className="w-5 h-5" />

                                                            Xóa
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* TOTAL */}
                                                <div
                                                    className="
                                                        lg:w-48
                                                        flex
                                                        lg:justify-end
                                                        items-start
                                                    "
                                                >
                                                    <div
                                                        className="
                                                            bg-slate-50
                                                            rounded-2xl
                                                            px-5 py-4
                                                            w-full
                                                            lg:w-auto
                                                        "
                                                    >
                                                        <p
                                                            className="
                                                                text-sm
                                                                text-slate-500
                                                                mb-1
                                                            "
                                                        >
                                                            Thành tiền
                                                        </p>

                                                        <p
                                                            className="
                                                                text-2xl
                                                                font-black
                                                                text-red-500
                                                            "
                                                        >
                                                            {(
                                                                parseFloat(
                                                                    item
                                                                        .product
                                                                        .price
                                                                ) *
                                                                item.quantity
                                                            ).toLocaleString()}
                                                            đ
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="space-y-6">

                        {/* VOUCHER */}
                        <div
                            className="
                                bg-gradient-to-br
                                from-green-500
                                to-emerald-600
                                rounded-3xl
                                shadow-xl
                                p-6
                                text-white
                            "
                        >
                            <h3
                                className="
                                    text-2xl
                                    font-bold
                                    mb-4
                                "
                            >
                                Voucher
                            </h3>

                            <select
                                onChange={(e) =>
                                    handleApplyVoucher(
                                        e.target
                                            .value
                                    )
                                }
                                value={
                                    appliedVoucher?.id ||
                                    ""
                                }
                                className="
                                    w-full
                                    h-12
                                    rounded-2xl
                                    px-4
                                    text-slate-700
                                    outline-none
                                "
                            >
                                <option value="">
                                    -- Chọn voucher --
                                </option>

                                {allVouchers.map(
                                    (
                                        v
                                    ) => (
                                        <option
                                            key={
                                                v.id
                                            }
                                            value={
                                                v.id
                                            }
                                        >
                                            {
                                                v.code
                                            }{" "}
                                            -{" "}
                                            {
                                                v.discount
                                            }
                                            %
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        {/* PAYMENT */}
                        <div
                            className="
                                bg-white
                                rounded-3xl
                                shadow-lg
                                p-6
                            "
                        >
                            <h3
                                className="
                                    text-2xl
                                    font-bold
                                    text-slate-800
                                    mb-5
                                "
                            >
                                Thanh toán
                            </h3>

                            <div className="space-y-3">

                                {paymentMethods.map(
                                    (
                                        pm
                                    ) => (
                                        <label
                                            key={
                                                pm.value
                                            }
                                            className={`
                                                flex
                                                items-center
                                                gap-4
                                                border-2
                                                rounded-2xl
                                                p-4
                                                cursor-pointer
                                                transition
                                                ${paymentMethod ===
                                                    pm.value
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-slate-200 hover:border-blue-200"
                                                }
                                            `}
                                        >
                                            <input
                                                type="radio"
                                                checked={
                                                    paymentMethod ===
                                                    pm.value
                                                }
                                                onChange={() =>
                                                    setPaymentMethod(
                                                        pm.value
                                                    )
                                                }
                                            />

                                            <img
                                                src={
                                                    pm.logo
                                                }
                                                alt={
                                                    pm.label
                                                }
                                                className="
                                                    w-10 h-10
                                                    object-contain
                                                "
                                            />

                                            <span
                                                className="
                                                    font-medium
                                                    text-slate-700
                                                "
                                            >
                                                {
                                                    pm.label
                                                }
                                            </span>
                                        </label>
                                    )
                                )}
                            </div>
                        </div>

                        {/* SUMMARY */}
                        <div
                            className="
                                bg-white
                                rounded-3xl
                                shadow-lg
                                p-6
                                sticky top-24
                            "
                        >
                            <h3
                                className="
                                    text-2xl
                                    font-bold
                                    text-slate-800
                                    mb-6
                                "
                            >
                                Tổng thanh toán
                            </h3>

                            <div className="space-y-4">

                                <div
                                    className="
                                        flex
                                        justify-between
                                        text-slate-600
                                    "
                                >
                                    <span>
                                        Tạm tính
                                    </span>

                                    <span>
                                        {total.toLocaleString()}
                                        đ
                                    </span>
                                </div>

                                <div
                                    className="
                                        flex
                                        justify-between
                                        text-slate-600
                                    "
                                >
                                    <span>
                                        Điểm thưởng
                                    </span>

                                    <span>
                                        -
                                        {discountByPoint.toLocaleString()}
                                        đ
                                    </span>
                                </div>

                                <div
                                    className="
                                        flex
                                        justify-between
                                        text-slate-600
                                    "
                                >
                                    <span>
                                        Voucher
                                    </span>

                                    <span>
                                        -
                                        {discountByVoucher.toLocaleString()}
                                        đ
                                    </span>
                                </div>

                                <div
                                    className="
                                        border-t
                                        pt-5
                                        flex
                                        justify-between
                                        items-center
                                    "
                                >
                                    <span
                                        className="
                                            text-lg
                                            font-semibold
                                        "
                                    >
                                        Tổng cộng
                                    </span>

                                    <span
                                        className="
                                            text-3xl
                                            font-black
                                            text-red-500
                                        "
                                    >
                                        {totalAmount.toLocaleString()}
                                        đ
                                    </span>
                                </div>

                                <button
                                    disabled={
                                        loading
                                    }
                                    onClick={
                                        handleConfirmOrder
                                    }
                                    className="
                                        w-full
                                        h-14
                                        rounded-2xl
                                        bg-gradient-to-r
                                        from-blue-600
                                        to-indigo-600
                                        text-white
                                        font-bold
                                        text-lg
                                        hover:scale-[1.02]
                                        transition
                                        shadow-lg
                                        disabled:opacity-70
                                    "
                                >
                                    {loading
                                        ? "Đang xử lý..."
                                        : "Xác nhận đặt hàng"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;