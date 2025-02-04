import { TableContainer, Table, TableBody, Paper } from '@mui/material';
import React from 'react';

import ProductInfoTableRow from '@/pages/cart/components/ProductInfoTableRow';
import { useCartStore } from '@/store/cart';
import { useUserStore } from '@/store/user';
import { pick } from '@/utils/common';

const ProductInfoTable = () => {
  // 테스트 실행 전에 zustand 스토어의 state를 원하는 대로 변경 필요
  const { cart, removeCartItem, changeCartItemCount } = useCartStore(state =>
    pick(state, 'cart', 'removeCartItem', 'changeCartItemCount'),
  );
  const { user } = useUserStore(state => pick(state, 'user'));

  return (
    <TableContainer component={Paper} sx={{ wordBreak: 'break-word' }}>
      <Table aria-label="장바구니 리스트">
        <TableBody>
          {Object.values(cart).map(item => (
            <ProductInfoTableRow
              key={item.id}
              item={item}
              user={user}
              removeCartItem={removeCartItem}
              changeCartItemCount={changeCartItemCount}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductInfoTable;
